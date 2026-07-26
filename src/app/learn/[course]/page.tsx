import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronRight, Trophy } from "lucide-react";
import { getCourse, courses } from "@/lib/learn-data";
import { Card } from "@/components/ui/card";

export function generateStaticParams() {
  return courses.map((c) => ({ course: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course: courseSlug } = await params;
  const course = getCourse(courseSlug);
  if (!course) return { title: "Course Not Found" };
  return {
    title: `${course.title} — RupeeMap Learn`,
    description: course.subtitle,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course: courseSlug } = await params;
  const course = getCourse(courseSlug);
  if (!course) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/learn" className="hover:text-primary transition-colors">
          Learn
        </Link>
        <span>/</span>
        <span className="text-on-surface">{course.title}</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <span className="text-5xl mb-4 block">{course.emoji}</span>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
        <p className="text-muted-foreground text-lg mb-4">{course.subtitle}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {course.lessons.length} lessons
          </span>
          <span>{course.ageRange}</span>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-3 mb-10">
        {course.lessons.map((lesson, i) => (
          <Link
            key={lesson.slug}
            href={`/learn/${course.slug}/${lesson.slug}`}
          >
            <Card className="p-4 md:p-5 hover:border-primary/50 transition-all group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lesson.objectives[0]}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Badge */}
      <Card className="p-6 text-center bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <Trophy className="h-12 w-12 mx-auto text-amber-400 mb-3" />
        <h3 className="text-lg font-bold mb-1">{course.badgeName}</h3>
        <p className="text-sm text-muted-foreground">
          Complete all {course.lessons.length} lessons and pass each quiz with 60%
          or more to earn this badge!
        </p>
      </Card>
    </div>
  );
}
