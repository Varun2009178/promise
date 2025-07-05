import { useEffect, useState } from 'react';

interface AnalogClockProps {
  size?: number;
  darkMode?: boolean;
  targetTime?: string | null;
}

export function AnalogClock({ size = 200, darkMode = true, targetTime }: AnalogClockProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted || !time) {
    return (
      <div className="flex flex-col items-center gap-8">
        {targetTime && (
          <div className="text-center">
            <div className="text-gray-400 text-lg font-light mb-1">
              Complete by {targetTime}
            </div>
            <div className="text-gray-500 text-sm">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        )}
        <div 
          className="relative rounded-full"
          style={{ 
            width: size, 
            height: size,
            backgroundColor: '#1a1a1a',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Static clock face without hands */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[1px] rounded-full transform -translate-x-1/2"
              style={{
                height: i % 3 === 0 ? '8px' : '4px',
                backgroundColor: 'rgb(156 163 175)',
                opacity: i % 3 === 0 ? 1 : 0.5,
                left: '50%',
                top: '0',
                transformOrigin: `50% ${size / 2}px`,
                transform: `rotate(${i * 30}deg) translateY(2px)`
              }}
            />
          ))}
          <div
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: '4px',
              height: '4px',
              backgroundColor: 'rgb(255 255 255)',
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      </div>
    );
  }

  // Calculate hand angles
  const minutesAngle = (time.getMinutes() * 6 + time.getSeconds() * 0.1) - 90;
  const hoursAngle = (time.getHours() % 12 * 30 + time.getMinutes() * 0.5) - 90;

  const textColor = 'rgb(156 163 175)'; // gray-400
  const accentColor = 'rgb(255 255 255)'; // white
  const backgroundColor = '#1a1a1a';

  // Format current time for digital display
  const currentTimeString = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Target time display */}
      {targetTime && (
        <div className="text-center">
          <div className="text-gray-400 text-lg font-light mb-1">
            Complete by {targetTime}
          </div>
          <div className="text-gray-500 text-sm">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        </div>
      )}
      

      
      <div 
        className="relative rounded-full transition-transform duration-300"
        style={{ 
          width: size, 
          height: size,
          backgroundColor,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Minimal hour markers */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[1px] rounded-full transform -translate-x-1/2"
            style={{
              height: i % 3 === 0 ? '8px' : '4px',
              backgroundColor: textColor,
              opacity: i % 3 === 0 ? 1 : 0.5,
              left: '50%',
              top: '0',
              transformOrigin: `50% ${size / 2}px`,
              transform: `rotate(${i * 30}deg) translateY(2px)`
            }}
          />
        ))}

        {/* Hour hand */}
        <div
          className="absolute left-1/2 top-1/2 rounded-full origin-center transition-transform"
          style={{
            width: '1.5px',
            height: `${size * 0.2}px`,
            backgroundColor: accentColor,
            transform: `rotate(${hoursAngle}deg)`,
            transformOrigin: '50% 100%',
            marginLeft: '-0.75px',
            marginTop: `-${size * 0.2}px`
          }}
        />

        {/* Minute hand */}
        <div
          className="absolute left-1/2 top-1/2 rounded-full origin-center transition-transform"
          style={{
            width: '1.5px',
            height: `${size * 0.3}px`,
            backgroundColor: accentColor,
            transform: `rotate(${minutesAngle}deg)`,
            transformOrigin: '50% 100%',
            marginLeft: '-0.75px',
            marginTop: `-${size * 0.3}px`
          }}
        />

        {/* Center dot */}
        <div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: '4px',
            height: '4px',
            backgroundColor: accentColor,
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>
    </div>
  );
} 