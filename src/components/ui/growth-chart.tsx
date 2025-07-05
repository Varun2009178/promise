import { useMemo } from 'react';

interface PromiseDay {
  date: string;
  completed: boolean;
  promise_text?: string;
}

interface GrowthChartProps {
  promises: PromiseDay[];
  maxDays?: number;
}

export function GrowthChart({ promises, maxDays = 30 }: GrowthChartProps) {
  // Group promises by week for better visual organization
  const weeks = useMemo(() => {
    const sortedPromises = [...promises]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, maxDays);

    const weekGroups: PromiseDay[][] = [];
    let currentWeek: PromiseDay[] = [];

    sortedPromises.forEach((promise) => {
      if (currentWeek.length === 7) {
        weekGroups.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(promise);
    });

    if (currentWeek.length > 0) {
      weekGroups.push(currentWeek);
    }

    return weekGroups;
  }, [promises, maxDays]);

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-3">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-3 justify-center">
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className="group relative"
                title={day.promise_text ? `${new Date(day.date).toLocaleDateString()}: ${day.promise_text}` : 'No promise this day'}
              >
                {/* Garden element */}
                <div 
                  className={`
                    w-8 h-8 rounded-full 
                    transition-all duration-500
                    ${day.completed 
                      ? 'bg-emerald-400/20 shadow-lg shadow-emerald-400/10' 
                      : 'bg-gray-800/50'}
                  `}
                >
                  {/* Stem */}
                  <div 
                    className={`
                      absolute left-1/2 bottom-full w-[1px] h-6
                      transition-all duration-500 origin-bottom
                      ${day.completed 
                        ? 'bg-emerald-400/30 scale-y-100' 
                        : 'bg-gray-700/30 scale-y-50'}
                    `}
                  />
                  
                  {/* Leaves */}
                  {day.completed && (
                    <>
                      <div 
                        className="
                          absolute left-1/2 bottom-[80%] w-3 h-3
                          border-t border-l border-emerald-400/30
                          transform -translate-x-full -rotate-45
                          transition-all duration-500
                        "
                      />
                      <div 
                        className="
                          absolute left-1/2 bottom-[60%] w-3 h-3
                          border-t border-r border-emerald-400/30
                          transform rotate-45
                          transition-all duration-500
                        "
                      />
                    </>
                  )}
                </div>

                {/* Hover tooltip */}
                <div className="
                  absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                  bg-black/90 text-white text-xs rounded-lg px-3 py-1
                  opacity-0 group-hover:opacity-100 transition-opacity
                  whitespace-nowrap pointer-events-none
                ">
                  {new Date(day.date).toLocaleDateString()}
                  {day.promise_text && (
                    <>
                      <br />
                      {day.promise_text}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 