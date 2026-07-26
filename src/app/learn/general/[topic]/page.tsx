import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { generalTopics, getGeneralTopic } from "@/lib/general-learn-data";

export function generateStaticParams() {
  return generalTopics.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await params;
  const topic = getGeneralTopic(slug);
  if (!topic) return { title: "Topic Not Found" };
  return {
    title: `${topic.title} — RupeeMap Learn`,
    description: topic.subtitle,
  };
}

export default async function GeneralTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await params;
  const topic = getGeneralTopic(slug);
  if (!topic) notFound();

  const currentIndex = generalTopics.findIndex((t) => t.slug === slug);
  const prevTopic = currentIndex > 0 ? generalTopics[currentIndex - 1] : null;
  const nextTopic =
    currentIndex < generalTopics.length - 1
      ? generalTopics[currentIndex + 1]
      : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/learn" className="hover:text-primary transition-colors">
          Learn
        </Link>
        <span>/</span>
        <Link
          href="/learn"
          className="hover:text-primary transition-colors"
        >
          Financial Literacy
        </Link>
        <span>/</span>
        <span className="text-on-surface">{topic.title}</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{topic.icon}</span>
          <div>
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
            <h1 className="text-3xl md:text-4xl font-bold">{topic.title}</h1>
          </div>
        </div>
        <p className="text-lg text-muted-foreground mb-4">{topic.subtitle}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {topic.readTime}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {topic.sections.length} sections
          </span>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="p-5 rounded-lg bg-muted/30 border border-border/50 mb-10">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">
          In this article
        </p>
        <ul className="space-y-2">
          {topic.sections.map((section, i) => (
            <li key={i}>
              <a
                href={`#section-${i}`}
                className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
              >
                <span className="text-primary font-data text-xs">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {section.heading || `Section ${i + 1}`}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Article Content */}
      <article className="space-y-10">
        {topic.sections.map((section, i) => (
          <section key={i} id={`section-${i}`}>
            {section.heading && (
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-primary font-data text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {section.heading}
              </h2>
            )}
            <div className="space-y-4">
              {section.body.split("\n\n").map((para, j) => (
                <div
                  key={j}
                  className="text-sm leading-relaxed text-on-surface-variant"
                  dangerouslySetInnerHTML={{
                    __html: para
                      .replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-on-surface">$1</strong>'
                      )
                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                      .replace(
                        /• /g,
                        '<span class="text-primary mr-1">•</span> '
                      )
                      .replace(
                        /\[(.*?)\]\((.*?)\)/g,
                        '<a href="$2" class="text-primary hover:underline">$1</a>'
                      )
                      .replace(/\n/g, "<br />"),
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </article>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-12 mt-12 border-t border-border">
        {prevTopic ? (
          <Link
            href={`/learn/general/${prevTopic.slug}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Previous</p>
              <p className="font-medium">{prevTopic.title}</p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {nextTopic ? (
          <Link
            href={`/learn/general/${nextTopic.slug}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <div className="text-right">
              <p className="text-xs text-primary/60">Next</p>
              <p className="font-medium">{nextTopic.title}</p>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            href="/learn"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Back to Learn
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
