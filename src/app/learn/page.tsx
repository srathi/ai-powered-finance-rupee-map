import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Trophy,
  Clock,
} from "lucide-react";
import { courses } from "@/lib/learn-data";
import { generalTopics } from "@/lib/general-learn-data";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Learn Finance",
  description:
    "Interactive finance lessons for kids and comprehensive financial literacy guides for adults.",
};

export default function LearnPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-medium">
            Interactive Learning
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Learn Finance the{" "}
          <span className="text-primary">Fun Way</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          From kids' money basics to adult financial planning — learn at your
          own pace with stories, quizzes, and real-world examples.
        </p>
      </div>

      {/* ═══════════ KIDS SECTION ═══════════ */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🧒</span>
          <div>
            <h2 className="text-2xl font-bold">For Kids</h2>
            <p className="text-sm text-muted-foreground">
              Fun lessons with stories and quizzes • Ages 5–15
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link key={course.slug} href={`/learn/${course.slug}`}>
              <Card
                className={`relative overflow-hidden h-full hover:border-primary/50 transition-all group cursor-pointer bg-gradient-to-br ${course.color}`}
              >
                <div className="p-6">
                  <span className="text-4xl mb-4 block">{course.emoji}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <BookOpen className="h-3.5 w-3.5" />
                    {course.lessons.length} lessons
                    <span className="text-muted-foreground/40">·</span>
                    {course.ageRange}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {course.subtitle}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium group-hover:gap-2.5 transition-all">
                    Start Learning
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="px-6 pb-5">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-border/50">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-muted-foreground">
                      Earn: {course.badgeName}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Kids Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mt-6">
          <div className="text-center p-3">
            <p className="text-xl font-bold text-primary">15</p>
            <p className="text-xs text-muted-foreground">Lessons</p>
          </div>
          <div className="text-center p-3">
            <p className="text-xl font-bold text-primary">60</p>
            <p className="text-xs text-muted-foreground">Quiz Questions</p>
          </div>
          <div className="text-center p-3">
            <p className="text-xl font-bold text-primary">3</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
        </div>
      </div>

      {/* ═══════════ GENERAL SECTION ═══════════ */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📖</span>
          <div>
            <h2 className="text-2xl font-bold">Financial Literacy</h2>
            <p className="text-sm text-muted-foreground">
              In-depth guides with real-world examples • No quizzes, just knowledge
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {generalTopics.map((topic) => (
            <Link key={topic.slug} href={`/learn/general/${topic.slug}`}>
              <Card className="p-5 hover:border-primary/50 transition-all group cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <span className="text-3xl mt-1">{topic.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {topic.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors mb-1">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {topic.subtitle}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {topic.readTime}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-2" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
