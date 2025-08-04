import React, { useMemo } from 'react';
import AnimatedDigit from './AnimatedDigit';

const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 0) return '0s';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours === 0 && minutes === 0 && totalSeconds < 10) return `${totalSeconds}s`;

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (hours === 0 && seconds > 0) result += `${seconds}s`;
    
    return result.trim() || '0s';
};

const AnimatedDuration: React.FC<{ durationMs: number }> = ({ durationMs }) => {
    const formattedTime = useMemo(() => formatDuration(durationMs), [durationMs]);

    const parts = useMemo(() => {
        const result: React.ReactNode[] = [];
        let currentNumber = '';

        const pushNumber = () => {
            if (currentNumber) {
                result.push(
                    <div key={`num-${result.length}`} className="flex">
                        {currentNumber.split('').map((digit, i) => (
                            <AnimatedDigit key={i} digit={parseInt(digit, 10)} />
                        ))}
                    </div>
                );
                currentNumber = '';
            }
        };

        for (const char of formattedTime) {
            if (!isNaN(parseInt(char, 10))) {
                currentNumber += char;
            } else {
                pushNumber();
                result.push(<span key={`char-${result.length}`}>{char}</span>);
            }
        }
        pushNumber();
        return result;
    }, [formattedTime]);

    return (
        <div className="flex items-center justify-end" style={{fontVariantNumeric: 'tabular-nums'}}>
            {parts}
        </div>
    );
};

export default AnimatedDuration;
