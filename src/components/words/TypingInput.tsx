import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BsCursorFill } from 'react-icons/bs';
import { BsFlagFill } from 'react-icons/bs';
import useTyping from 'react-typing-game-hook';

import Tooltip from '@/components/Tooltip';

import { usePreferenceContext } from '@/context/Preference/PreferenceContext';

type TypingInputProps = {
  text: string;
  time: string;
} & React.ComponentPropsWithRef<'input'>;

const TypingInput = React.forwardRef<HTMLInputElement, TypingInputProps>(
  ({ text, time }, ref) => {
    const [duration, setDuration] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const letterElements = useRef<HTMLDivElement>(null);
    const [timeLeft, setTimeLeft] = useState(() => parseInt(time));

    const {
      preferences: { isOpen },
    } = usePreferenceContext();

    const {
      states: {
        charsState,
        currIndex,
        phase,
        correctChar,
        errorChar,
        startTime,
        endTime,
      },
      actions: { insertTyping, deleteTyping, resetTyping, endTyping },
    } = useTyping(text, { skipCurrentWordOnSpace: true, pauseOnError: false });

    // set cursor
    const pos = useMemo(() => {
      if (currIndex !== -1 && letterElements.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spanref: any = letterElements.current.children[currIndex];
        const left = spanref.offsetLeft + spanref.offsetWidth - 2;
        const top = spanref.offsetTop - 2;
        return { left, top };
      } else {
        return {
          left: -2,
          top: 2,
        };
      }
    }, [currIndex]);

    useEffect(() => {
      setTimeLeft(parseInt(time));
      endTyping();
      resetTyping();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, time]);

    // handle timer
    useEffect(() => {
      const timerInterval = setInterval(() => {
        if (phase === 1) {
          setTimeLeft((timeLeft) => {
            if (timeLeft === 1) {
              clearInterval(timerInterval);
              endTyping();
            }
            return timeLeft - 1;
          });
        }
      }, 1000);

      return () => clearInterval(timerInterval);
    }, [endTyping, phase]);

    //set WPM
    useEffect(() => {
      if (phase === 2 && endTime && startTime) {
        setDuration(Math.floor((endTime - startTime) / 1000));
      } else {
        setDuration(0);
      }
    }, [phase, startTime, endTime, ref]);

    //handle key presses
    const handleKeyDown = (letter: string, control: boolean) => {
      if (letter === 'Backspace') {
        deleteTyping(control);
      } else if (letter.length === 1) {
        insertTyping(letter);
      }
    };

    return (
      <div className='relative w-full max-w-[950px]'>
        <span className='absolute left-0 -top-14 text-4xl text-fg/80'>
          {timeLeft}
        </span>
        <div
          className={clsx('relative h-[140px] w-full text-2xl outline-none')}
        >
          <input
            type='text'
            className='absolute left-0 top-0 z-50 h-full w-full cursor-default opacity-0'
            tabIndex={1}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (isOpen) {
                setIsFocused(false);
                return;
              }
              if (e.key === ' ') e.preventDefault();
              if (e.ctrlKey) return;
              handleKeyDown(e.key, e.ctrlKey);
            }}
          />
          <div
            className={clsx(
              'absolute bottom-0 z-10 h-8 w-full bg-gradient-to-t from-bg transition-all duration-200',
              { 'opacity-0': !isFocused }
            )}
          ></div>
          <span
            className={clsx(
              'absolute z-20 flex h-full w-full cursor-default items-center justify-center text-base opacity-0 transition-all duration-200',
              { 'text-fg opacity-100 ': !isFocused }
            )}
          >
            Click
            <BsCursorFill className='mx-2 scale-x-[-1]' />
            or press any key to focus
          </span>
          <div
            ref={letterElements}
            className={clsx(
              'absolute top-0 left-0 mb-4 h-full w-full overflow-hidden text-justify leading-relaxed tracking-wide transition-all duration-200',
              { 'opacity-40 blur-[8px]': !isFocused }
            )}
          >
            {text.split('').map((letter, index) => {
              const state = charsState[index];
              const color =
                state === 0
                  ? 'text-font'
                  : state === 1
                  ? 'text-fg'
                  : 'text-hl border-b-2 border-hl';
              return (
                <span
                  key={letter + index}
                  className={`${color} ${letter === ' ' && ''}`}
                >
                  {letter}
                </span>
              );
            })}
          </div>
          {isFocused ? (
            <span
              style={{
                left: pos.left,
                top: pos.top + 2,
              }}
              className={clsx('caret text-hl', {
                '-mt-[2px]': currIndex === -1,
                'animate-blink': phase === 0,
              })}
            >
              {phase === 2 ? (
                <div className='group relative z-40'>
                  <Tooltip
                    className='bg-fg text-bg group-hover:translate-y-0 group-hover:opacity-100'
                    triangle='bg-fg'
                  >
                    You finished here.
                  </Tooltip>
                  <BsFlagFill className='-mb-[8px] text-fg' />
                </div>
              ) : (
                '|'
              )}
            </span>
          ) : null}
        </div>
        <div className='mt-4 flex w-full flex-col flex-wrap items-center justify-center gap-4 text-sm'>
          {phase === 2 && startTime && endTime ? (
            <div className='grid grid-rows-3 items-center gap-4 rounded-lg px-4 py-1 text-xl font-bold sm:flex'>
              <span>
                WPM: {Math.round(((60 / duration) * correctChar) / 5)}
              </span>
              <span>
                Accuracy:{' '}
                {(((correctChar - errorChar) / (currIndex + 1)) * 100).toFixed(
                  2
                )}
                %
              </span>
              <span>Duration: {duration}s</span>
            </div>
          ) : null}
          <div className='flex gap-4'>
            <span> Correct Characters: {correctChar}</span>
            <span> Error Characters: {errorChar}</span>
          </div>
        </div>
      </div>
    );
  }
);

export default TypingInput;
