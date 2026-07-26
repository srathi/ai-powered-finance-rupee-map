"use client";

import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import type { Course, Lesson } from "@/lib/learn-data";

interface LessonLayoutProps {
  course: Course;
  lesson: Lesson;
  totalLessons: number;
  children: React.ReactNode;
}

export function LessonLayout({
  course,
  lesson,
  totalLessons,
  children,
}: LessonLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/learn" className="hover:text-primary transition-colors">
          Learn
        </Link>
        <span>/</span>
        <Link
          href={`/learn/${course.slug}`}
          className="hover:text-primary transition-colors"
        >
          {course.title}
        </Link>
        <span>/</span>
        <span className="text-on-surface">{lesson.title}</span>
      </div>

      {/* Lesson Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{course.emoji}</span>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Lesson {lesson.number} of {totalLessons}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold">
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(lesson.number / totalLessons) * 100}%` }}
          />
        </div>

        {/* Objectives */}
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs text-primary uppercase tracking-wider mb-2 font-medium">
            🎯 In this lesson you'll learn:
          </p>
          <ul className="space-y-1">
            {lesson.objectives.map((obj, i) => (
              <li key={i} className="text-sm text-on-surface flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8 mb-12">{children}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 border-t border-border">
        {lesson.number > 1 ? (
          <Link
            href={`/learn/${course.slug}/${course.lessons[lesson.number - 2]?.slug}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <div />
        )}
        {lesson.number < totalLessons ? (
          <Link
            href={`/learn/${course.slug}/${course.lessons[lesson.number]?.slug}`}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Next Lesson
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            href="/learn"
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <BookOpen className="h-4 w-4" />
            All Courses
          </Link>
        )}
      </div>
    </div>
  );
}
