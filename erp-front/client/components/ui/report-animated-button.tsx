import { forwardRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { handleView } from "@/lib/function";

interface AnimatedButtonProps {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
  delay?: number;
  isRTL?: boolean;
  onClick?: () => void;
  firstAr?: string;
  first?: string;
  secondAr?: string;
  second?: string;
  thirdAr?: string;
  third?: string;
}

const ReportAnimatedButton = forwardRef<HTMLAnchorElement, AnimatedButtonProps>(
  (
    {
      title,
      titleAr,
      description,
      descriptionAr,
      icon: Icon,
      href,
      gradient,
      delay = 0,
      isRTL = false,
      onClick,
      firstAr,
      first,
      secondAr,
      second,
      thirdAr,
      third
    },
    ref,
  ) => {
    const animationDelay = `${delay}ms`;
    const navigate = useNavigate();

    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:scale-105",
          "bg-card border border-sidebar-border shadow-lg hover:shadow-2xl",
          "animate-scale-in",
          gradient,
        )}
        style={{ animationDelay }}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Floating animation background */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rounded-full animate-float" />
        <div
          className="absolute -bottom-10 -left-10 w-16 h-16 bg-white/5 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative z-10">
          {/* Icon */}
          <div className="mb-4 transform transition-transform duration-300 group-hover:scale-110 flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
              {isRTL ? titleAr : title}
            </h3>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <p
              onClick={() =>
                handleView(
                  {
                    name: first,
                    nameAr: firstAr,
                    title: title,
                    titleAr: titleAr,
                  },
                  navigate,
                  href,
                )
              }
              className="text-white/80 text-sm leading-relaxed group-hover:text-white transition-colors cursor-pointer hover:underline hover:font-medium hover:text-white hover:transition-colors hover:duration-300 hover:ease-in-out "
            >
              {isRTL ? firstAr : first}
            </p>

            {second !== "" && (
              <p
                onClick={() =>
                  handleView(
                    {
                      name: second,
                      nameAr: secondAr,
                      title: title,
                      titleAr: titleAr,
                    },
                    navigate,
                    href,
                  )
                }
                className="text-white/80 text-sm leading-relaxed group-hover:text-white transition-colors cursor-pointer hover:underline hover:font-medium hover:text-white hover:transition-colors hover:duration-300 hover:ease-in-out "
              >
                {isRTL ? secondAr : second}
              </p>
            )}

            {third !== "" && (
              <p
                onClick={() =>
                  handleView(
                    {
                      name: third,
                      nameAr: thirdAr,
                      title: title,
                      titleAr: titleAr,
                    },
                    navigate,
                    href,
                  )
                }
                className="text-white/80 text-sm leading-relaxed group-hover:text-white transition-colors cursor-pointer hover:underline hover:font-medium hover:text-white hover:transition-colors hover:duration-300 hover:ease-in-out "
              >
                {isRTL ? thirdAr : third}
              </p>
            )}
          </div>

          {/* Arrow indicator thirdAr */}
          {/* <div className="mt-4 flex items-center text-white/60 text-sm group-hover:text-white/80 transition-colors">
            <span
              className={cn(
                "transform transition-transform duration-300",
                isRTL
                  ? "group-hover:-translate-x-1"
                  : "group-hover:translate-x-1",
              )}
            >
              {isRTL ? "← انقر للدخول" : "Click to enter →"}
            </span>
          </div> */}
        </div>

        {/* Hover effect border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    );
  },
);

ReportAnimatedButton.displayName = "AnimatedButton";

export { ReportAnimatedButton };
