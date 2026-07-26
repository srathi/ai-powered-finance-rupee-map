"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { Lightbulb, Sparkles, Zap, Trophy, PartyPopper } from "lucide-react";
import { getLesson, courses } from "@/lib/learn-data";
import { LessonLayout } from "@/components/lesson-layout";
import { QuizCard } from "@/components/quiz-card";
import { Card } from "@/components/ui/card";

const STORAGE_KEY = "rupeemap-learn-progress";

function getProgress(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(courseSlug: string, lessonSlug: string, score: number) {
  const progress = getProgress();
  const key = `${courseSlug}/${lessonSlug}`;
  const prev = progress[key] || 0;
  progress[key] = Math.max(prev, score);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getCompletedCount(courseSlug: string): number {
  const progress = getProgress();
  const course = courses.find((c) => c.slug === courseSlug);
  if (!course) return 0;
  return course.lessons.filter((l) => {
    const key = `${courseSlug}/${l.slug}`;
    return (progress[key] || 0) >= 60;
  }).length;
}

export default function LessonPage() {
  const params = useParams();
  const courseSlug = params.course as string;
  const lessonSlug = params.lesson as string;

  const result = getLesson(courseSlug, lessonSlug);
  if (!result) notFound();

  const { course, lesson, lessonIndex } = result;
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizPassed, setQuizPassed] = useState(false);

  useEffect(() => {
    const progress = getProgress();
    const key = `${courseSlug}/${lessonSlug}`;
    const saved = progress[key];
    if (saved && saved >= 60) {
      setQuizScore(saved);
      setQuizPassed(true);
    }
  }, [courseSlug, lessonSlug]);

  const handleQuizComplete = (score: number, passed: boolean) => {
    setQuizScore(score);
    setQuizPassed(passed);
    if (passed) {
      saveProgress(courseSlug, lessonSlug, score);
    }
  };

  const contentIcon = (type: string) => {
    switch (type) {
      case "story":
        return <Sparkles className="h-5 w-5 text-primary" />;
      case "fun-fact":
        return <Lightbulb className="h-5 w-5 text-amber-400" />;
      case "activity":
        return <Zap className="h-5 w-5 text-emerald-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <LessonLayout
      course={course}
      lesson={lesson}
      totalLessons={course.lessons.length}
    >
      {/* Content Blocks */}
      {lesson.content.map((block, i) => (
        <div key={i}>
          {block.title && (
            <div className="flex items-center gap-2 mb-3">
              {contentIcon(block.type)}
              <h2 className="text-lg font-bold">{block.title}</h2>
            </div>
          )}
          <div className="prose prose-invert max-w-none">
            {block.body.split("\n\n").map((para, j) => (
              <p
                key={j}
                className="text-sm leading-relaxed text-on-surface-variant mb-3"
                dangerouslySetInnerHTML={{
                  __html: para
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-on-surface">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/• /g, '<span class="text-primary mr-1">•</span> '),
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Key Concepts */}
      <div className="grid md:grid-cols-3 gap-3">
        {lesson.concepts.map((concept, i) => (
          <Card key={i} className="p-4">
            <span className="text-2xl mb-2 block">{concept.icon}</span>
            <h4 className="font-semibold text-sm mb-1">{concept.title}</h4>
            <p className="text-xs text-muted-foreground">
              {concept.description}
            </p>
          </Card>
        ))}
      </div>

      {/* Quiz Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-amber-400" />
          <h2 className="text-xl font-bold">Quick Check</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Score at least 60% to complete this lesson.
          {quizPassed && (
            <span className="text-emerald-400 ml-2">
              ✅ You already passed this quiz!
            </span>
          )}
        </p>

        {quizPassed && quizScore !== null ? (
          <Card className="p-6 text-center">
            <PartyPopper className="h-12 w-12 mx-auto text-amber-400 mb-3" />
            <h3 className="text-lg font-bold mb-1">Quiz Completed!</h3>
            <p className="text-3xl font-bold text-emerald-400 mb-2">
              {quizScore}%
            </p>
            <p className="text-sm text-muted-foreground">
              You passed this lesson. Great work!
            </p>
          </Card>
        ) : (
          <QuizCard
            questions={lesson.quiz}
            passingScore={60}
            onComplete={handleQuizComplete}
            courseEmoji={course.emoji}
          />
        )}
      </div>
    </LessonLayout>
  );
}
