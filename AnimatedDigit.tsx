import React from 'react';

const AnimatedDigit: React.FC<{ digit: number }> = React.memo(({ digit }) => {
    const translateY = `translateY(-${digit * 10}%)`;
    return (
        <div className="h-[1em] overflow-hidden">
            <div
                className="transition-transform duration-500 ease-in-out"
                style={{ transform: translateY }}
            >
                {'0123456789'.split('').map(d => (
                    <div key={d} className="h-[1em] leading-[1em]">{d}</div>
                ))}
            </div>
        </div>
    );
});

export default AnimatedDigit;
