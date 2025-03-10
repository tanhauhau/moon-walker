import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Jackson.css';
// the original duck walk https://www.youtube.com/watch?v=EqS76TFCCYs

// useInterval
// copied wholesale from https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      !!savedCallback.current && savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function useDanceStage() {
  const bodyPartRef = useRef();
  const setDanceStage = stageName => {
    if (bodyPartRef.current) {
      const classNames = Array.from(bodyPartRef.current.classList.values());
      for (const className of classNames) {
        if (className.startsWith('stage'))
          bodyPartRef.current.classList.remove(className);
      }
      bodyPartRef.current.classList.add(stageName);
    }
  };
  return [bodyPartRef, setDanceStage];
}

function useDanceMove(danceMove) {
  // body parts
  const [leftLegUpper, setLeftLegUpperStage] = useDanceStage();
  const [leftLegLower, setLeftLegLowerStage] = useDanceStage();
  const [leftLegFoot, setLeftLegFootStage] = useDanceStage();
  const [rightLegUpper, setRightLegUpperStage] = useDanceStage();
  const [rightLegLower, setRightLegLowerStage] = useDanceStage();
  const [rightLegFoot, setRightLegFootStage] = useDanceStage();
  // body positions
  const [rightOffset, setRightOffset] = useState(0);

  // advance to the next step of the dance
  const moveBodyParts = index => {
    const nextLeftLegStage = danceMove.leftLegStages[index];
    const nextRightLegStage = danceMove.rightLegStages[index];
    setLeftLegUpperStage(nextLeftLegStage);
    setLeftLegLowerStage(nextLeftLegStage);
    setLeftLegFootStage(nextLeftLegStage);
    setRightLegUpperStage(nextRightLegStage);
    setRightLegLowerStage(nextRightLegStage);
    setRightLegFootStage(nextRightLegStage);
    setRightOffset(rightOffset + danceMove.rightOffset);
  };
  return [
    {
      leftLegUpper,
      leftLegLower,
      leftLegFoot,
      rightLegUpper,
      rightLegLower,
      rightLegFoot,
      rightOffset,
    },
    moveBodyParts,
    setRightOffset,
  ];
}

const DANCE_MOVES = {
  MOON_WALK: {
    leftLegStages: ['stage-1', 'stage-2', 'stage-3', 'stage-2'],
    rightLegStages: ['stage-3', 'stage-2', 'stage-1', 'stage-2'],
    rightOffset: 60,
  },
  DUCK_WALK: {
    leftLegStages: ['stage-4', 'stage-6', 'stage-4', 'stage-6'],
    rightLegStages: ['stage-5', 'stage-7', 'stage-5', 'stage-7'],
    rightOffset: 60,
  },
};

export default function Jackson() {
  const animationTimingFunc = [
    'cubic-bezier(.87,.57,1,.68)',
    'cubic-bezier(0,.06,0,1.16)',
    'cubic-bezier(.87,.57,1,.68)',
    'cubic-bezier(0,.06,0,1.16)',
  ];

  /* animations
  0: ease in
  1: ease out
  2: ease in
  3: ease out
  */
  const NUM_MOVES = 4;
  const DUCK_WALK_MODE = 'DUCK_WALK';
  const MOON_WALK_MODE = 'MOON_WALK';
  /* states */
  const [rightPos, setRightPos] = useState(0);
  const [index, setIndex] = useState(1);
  const [animStage, setAnimStage] = useState(0);
  const [animFunc, setAnimFunc] = useState('');
  const [danceMode, setDanceMode] = useState(
    MOON_WALK_MODE
  ); /* 0: moon walk, 1: duck walk */
  const [on, setOn] = useState(false);
  const [delay, setDelay] = useState(700);
  const [animDur, setAnimDur] = useState(0.7);

  const jackson = useCallback(node => {
    if (node !== null) {
      setRightPos(node.getBoundingClientRect().right);
    }
  });
  // the use states
  const changeDelay = e => setDelay(e.target.value);
  const toggleDance = () => setDanceMode(danceMode ^ 1);
  const [bodyParts, moveBodyParts, setRightOffset] = useDanceMove(
    DANCE_MOVES[danceMode]
  );
  const moveJacksonToEdge = () => setRightOffset(0);
  const toggleOn = () => setOn(!on);

  // use effects
  useEffect(() => {
    setAnimFunc(animationTimingFunc[animStage]);
  }, [animStage, animationTimingFunc]);
  useEffect(() => {
    if (rightPos <= 0) {
      // go out of stage
      setAnimDur(0);
      moveJacksonToEdge();
    }
  }, [rightPos]);

  // advance to the next step of the dance
  const moveOneIndex = () => {
    setAnimDur(0.7);
    moveBodyParts(index);
    setIndex((index + 1) % NUM_MOVES);
    setAnimStage((animStage + 1) % NUM_MOVES);
  };
  useInterval(
    moveOneIndex,
    on ? delay : null
  ); /* <-- This is the main call that kicks off the dancing */
  return (
    <div className="playground-moonwalk">
      <div className="ceiling"></div>
      <div className="dancer-space">
        <div
          className="micheal-jackson"
          id="micheal-jackson"
          ref={jackson}
          style={{
            right: bodyParts.rightOffset,
            transition: `right ${animDur}s ${animFunc}`,
            transform: `${danceMode === DUCK_WALK_MODE ? 'scale(-1,1)' : ''}`,
          }}
        >
          <div className="head">
            <div className="hat">
              <div className="hat-top"></div>
              <div className="hat-bottom"></div>
            </div>
            <div className="face"></div>
          </div>
          <div className="body">
            <div className="left-arm"></div>
            <div className="right-arm"></div>
          </div>
          <div className="legs">
            <div className="left-leg" id="left-leg">
              <div
                className="left-leg-upper leg-upper  stage-1"
                id="left-leg-upper"
                ref={bodyParts.leftLegUpper}
              ></div>
              <div
                className="left-leg-lower leg-lower stage-1"
                id="left-leg-lower"
                ref={bodyParts.leftLegLower}
              ></div>
              <div
                className="left-foot foot stage-1"
                id="left-foot"
                ref={bodyParts.leftLegFoot}
              ></div>
            </div>
            <div className="right-leg" id="right-leg">
              <div
                className="right-leg-upper leg-upper stage-3"
                id="right-leg-upper"
                ref={bodyParts.rightLegUpper}
              ></div>
              <div
                className="right-leg-lower leg-lower stage-3"
                id="right-leg-lower"
                ref={bodyParts.rightLegLower}
              ></div>
              <div
                className="right-foot foot stage-3"
                id="right-foot"
                ref={bodyParts.rightLegFoot}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div className="stage">
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 'larger',
              background: 'white',
              padding: '0 20px',
              fontWeight: '700',
              color: on ? 'red' : 'green',
            }}
            onClick={toggleOn}
          >
            {on ? 'STOP' : 'START'}
          </div>
          <form>
            <input
              type="number"
              value={delay}
              onChange={changeDelay}
              style={{ height: '100px', fontSize: '30px' }}
            />
          </form>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 'larger',
              background: 'white',
              padding: '0 20px',
              fontWeight: '700',
            }}
            onClick={toggleDance}
          >
            {danceMode === MOON_WALK_MODE ? 'Moon walk' : 'Duck walk'}
          </div>
        </div>
      </div>
    </div>
  );
}
