"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Trophy, ChevronRight } from "lucide-react";
import type { QuizQuestion } from "@/lib/learn-data";

interface QuizCardProps {
  questions: QuizQuestion[];
  passingScore?: number;
  onComplete: (score: number, passed: boolean) => void;
  courseEmoji: string;
}

export function QuizCard({
  questions,
  passingScore = 60,
  onComplete,
  courseEmoji,
}: QuizCardProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [finished, setFinished] = useState(false);

  const question = questions[currentQ];
  const isCorrect = selected === question.correctIndex;
  const score = Math.round(
    (answers.filter((a, i) => a === questions[i].correctIndex).length /
      questions.length) *
      100
  );

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setFinished(true);
      const finalScore = Math.round(
        (answers.filter((a, i) => a === questions[i].correctIndex).length /
          questions.length) *
          100
      );
      onComplete(finalScore, finalScore >= passingScore);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelected(null);
    setRevealed(false);
    setAnswers(new Array(questions.length).fill(null));
    setFinished(false);
  };

  if (finished) {
    const passed = score >= passingScore;
    return (
      <Card className="p-8 text-center">
        <div className="mb-4">
          {passed ? (
            <Trophy className="h-16 w-16 mx-auto text-amber-400" />
          ) : (
            <span className="text-5xl">{courseEmoji}</span>
          )}
        </div>
        <h3 className="text-2xl font-bold mb-2">
          {passed ? "🎉 Quiz Complete!" : "Almost There!"}
        </h3>
        <p className="text-6xl font-bold mb-2">
          <span className={passed ? "text-emerald-400" : "text-amber-400"}>
            {score}%
          </span>
        </p>
        <p className="text-muted-foreground mb-6">
          {passed
            ? "Amazing work! You've earned the badge. Keep learning!"
            : `You need ${passingScore}% to pass. Try again — you'll get it!`}
        </p>
        <div className="flex gap-3 justify-center">
          {!passed && (
            <Button onClick={handleRetry} variant="outline" className="gap-2">
              🔄 Try Again
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Question {currentQ + 1} of {questions.length}
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i < currentQ
                  ? answers[i] === questions[i].correctIndex
                    ? "bg-emerald-400"
                    : "bg-rose-400"
                  : i === currentQ
                    ? "bg-primary"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <h4 className="text-lg font-semibold mb-6">{question.question}</h4>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, idx) => {
          const isThisCorrect = idx === question.correctIndex;
          const isThisSelected = selected === idx;
          let borderColor = "border-border hover:border-primary/50";
          let bgColor = "bg-background";
          let textColor = "text-foreground";

          if (revealed) {
            if (isThisCorrect) {
              borderColor = "border-emerald-400";
              bgColor = "bg-emerald-400/10";
              textColor = "text-emerald-400";
            } else if (isThisSelected && !isThisCorrect) {
              borderColor = "border-rose-400";
              bgColor = "bg-rose-400/10";
              textColor = "text-rose-400";
            } else {
              borderColor = "border-border/30";
              bgColor = "bg-background/50";
              textColor = "text-muted-foreground";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={revealed}
              className={`w-full p-4 rounded-lg border text-left flex items-center gap-3 transition-all ${borderColor} ${bgColor} ${textColor} ${
                !revealed ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm shrink-0 ${
                  revealed && isThisCorrect
                    ? "border-emerald-400 bg-emerald-400/20 text-emerald-400"
                    : revealed && isThisSelected
                      ? "border-rose-400 bg-rose-400/20 text-rose-400"
                      : "border-border"
                }`}
              >
                {revealed && isThisCorrect ? (
                  <CheckCircle className="h-4 w-4" />
                ) : revealed && isThisSelected ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  String.fromCharCode(65 + idx)
                )}
              </span>
              <span className="text-sm">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {revealed && (
        <div
          className={`p-4 rounded-lg mb-6 text-sm ${
            isCorrect
              ? "bg-emerald-400/10 border border-emerald-400/20 text-emerald-400"
              : "bg-rose-400/10 border border-rose-400/20 text-rose-400"
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg mt-0.5">
              {isCorrect ? "✅" : "💡"}
            </span>
            <p>{question.explanation}</p>
          </div>
        </div>
      )}

      {/* Next Button */}
      {revealed && (
        <Button onClick={handleNext} className="w-full gap-2">
          {currentQ < questions.length - 1 ? (
            <>
              Next Question <ChevronRight className="h-4 w-4" />
            </>
          ) : (
            <>
              See Results <Trophy className="h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </Card>
  );
}
