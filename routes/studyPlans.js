const express = require('express');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const StudyPlan = require('../models/StudyPlan');
const { makeFallbackPlan } = require('../utils/fallbackPlans');

const router = express.Router();

function validatePlan(plan, totalDays) {
  if (!plan || typeof plan.title !== 'string' || typeof plan.description !== 'string' || !Array.isArray(plan.days)) return false;
  if (plan.days.length !== totalDays) return false;
  return plan.days.every((day, index) => Number(day.day) === index + 1 && typeof day.topic === 'string' && day.topic.trim());
}

async function generateWithGemini(input) {
  if (!process.env.GEMINI_API_KEY) return null;
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = client.getGenerativeModel({ model: 'gemini-3.8-flash' });
  const prompt = `Create a realistic day-wise study plan as ONLY valid JSON, with no markdown or extra text. Follow this exact shape: {"title":"...","description":"...","totalDays":${input.totalDays},"days":[{"day":1,"topic":"...","description":"...","objectives":["..."],"estimatedHours":${input.hoursPerDay},"practice":"...","searchQuery":"..."}]}. Make exactly ${input.totalDays} days. Subject: ${input.course}. Skill level: ${input.level}. Goal: ${input.goal}. Available time: ${input.hoursPerDay} hours each day. Extra requirements: ${input.additionalRequirements || 'None'}. Sequence topics logically, avoid repetition, include practice and revision, and finish with a mini-project when suitable. Keep workload realistic. Each searchQuery should be useful text for a YouTube search, not a video URL.`;
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.5 }
  });
  const text = result.response.text().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(text);
}

router.post('/generate', async (req, res, next) => {
  try {
    const { course, level, goal, hoursPerDay, totalDays, additionalRequirements } = req.body;
    const daysCount = Number(totalDays);
    const hours = Number(hoursPerDay);
    if (!course?.trim() || !level || !goal || !Number.isInteger(daysCount) || ![7, 15, 30, 60].includes(daysCount) || !Number.isFinite(hours) || hours < 1 || hours > 12) {
      return res.status(400).json({ message: 'Please complete the form with a valid course, duration, and daily study time.' });
    }

    let generated;
    let usedFallback = false;
    try {
      generated = await generateWithGemini({
        course: course.trim(), level, goal, hoursPerDay: hours, totalDays: daysCount,
        additionalRequirements: String(additionalRequirements || '').slice(0, 500)
      });
      if (!validatePlan(generated, daysCount)) throw new Error('Invalid AI plan structure');
    } catch (error) {
      console.warn('Gemini unavailable or returned an invalid plan; using demo plan.');
      generated = makeFallbackPlan(course.trim(), level, goal, hours, daysCount);
      usedFallback = true;
    }

    const plan = await StudyPlan.create({
      userId: req.session.userId,
      title: generated.title,
      description: generated.description,
      totalDays: daysCount,
      days: generated.days.map((day, index) => ({
        day: index + 1,
        topic: String(day.topic),
        description: String(day.description || ''),
        objectives: Array.isArray(day.objectives) ? day.objectives.map(String) : [],
        estimatedHours: Number(day.estimatedHours) || hours,
        practice: String(day.practice || ''),
        searchQuery: String(day.searchQuery || `${course} ${day.topic} tutorial`),
        completed: false
      }))
    });
    res.status(201).json({ planId: plan.id, demoMode: usedFallback });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const plans = await StudyPlan.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.json({ plans });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Study plan not found.' });
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.session.userId });
    if (!plan) return res.status(404).json({ message: 'Study plan not found.' });
    res.json({ plan });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/day/:dayNumber', async (req, res, next) => {
  try {
    const dayNumber = Number(req.params.dayNumber);
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.session.userId });
    if (!plan) return res.status(404).json({ message: 'Study plan not found.' });
    const day = plan.days.find((item) => item.day === dayNumber);
    if (!day) return res.status(404).json({ message: 'Study day not found.' });
    day.completed = Boolean(req.body.completed);
    await plan.save();
    res.json({ plan });
  } catch (error) {
    next(error);
  }
});

module.exports = router;