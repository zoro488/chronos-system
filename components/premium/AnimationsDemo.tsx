/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║              PREMIUM ANIMATIONS DEMO & VERIFICATION                        ║
 * ║  Demo page to showcase all premium animation components                   ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import React, { useState } from 'react';
import { AnimatedContainer } from './components/premium/AnimatedContainer';
import {
  AnimatedProgressBar,
  AnimatedSwitch,
  LoadingSpinner,
  RippleButton,
} from './components/premium/MicroInteractions';
import { useMouseParallax, useParallax } from './hooks/useAnimations';
import * as animations from './lib/animations';

/**
 * Demo page showcasing all premium animation components
 */
export const AnimationsDemo = () => {
  const [isOn, setIsOn] = useState(false);
  const [progress, setProgress] = useState(45);
  const parallaxRef = useParallax(0.3);
  const mouseParallaxRef = useMouseParallax();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Import animations.css to enable CSS animations */}
      <style>
        {`
          @import url('../styles/animations.css');
        `}
      </style>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4 animate-gradient">
            Premium Animations System
          </h1>
          <p className="text-white/70 text-lg">
            Showcasing all animation components and effects
          </p>
        </div>

        {/* Animated Containers */}
        <section className="glass p-8 rounded-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">Animated Containers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedContainer animation="fadeIn" className="glass-dark p-6 rounded-xl">
              <h3 className="text-white font-semibold mb-2">Fade In</h3>
              <p className="text-white/70 text-sm">Smooth opacity transition</p>
            </AnimatedContainer>

            <AnimatedContainer
              animation="slideInFromLeft"
              delay={0.2}
              className="glass-dark p-6 rounded-xl"
            >
              <h3 className="text-white font-semibold mb-2">Slide From Left</h3>
              <p className="text-white/70 text-sm">Slides in from the left side</p>
            </AnimatedContainer>

            <AnimatedContainer
              animation="scaleIn"
              delay={0.4}
              className="glass-dark p-6 rounded-xl"
            >
              <h3 className="text-white font-semibold mb-2">Scale In</h3>
              <p className="text-white/70 text-sm">Scales up with spring effect</p>
            </AnimatedContainer>
          </div>
        </section>

        {/* Micro Interactions */}
        <section className="glass p-8 rounded-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">Micro Interactions</h2>
          <div className="space-y-8">
            {/* Ripple Button */}
            <div>
              <h3 className="text-white font-semibold mb-3">Ripple Button</h3>
              <RippleButton onClick={() => console.log('Clicked!')}>
                Click me for ripple effect
              </RippleButton>
            </div>

            {/* Animated Switch */}
            <div>
              <h3 className="text-white font-semibold mb-3">Animated Switch</h3>
              <AnimatedSwitch isOn={isOn} onToggle={() => setIsOn(!isOn)} />
              <span className="text-white/70 ml-3">Switch is {isOn ? 'ON' : 'OFF'}</span>
            </div>

            {/* Progress Bar */}
            <div>
              <h3 className="text-white font-semibold mb-3">Animated Progress Bar</h3>
              <AnimatedProgressBar progress={progress} />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                  className="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition"
                >
                  -10%
                </button>
                <button
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                  className="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition"
                >
                  +10%
                </button>
              </div>
            </div>

            {/* Loading Spinner */}
            <div>
              <h3 className="text-white font-semibold mb-3">Loading Spinner</h3>
              <LoadingSpinner />
            </div>
          </div>
        </section>

        {/* CSS Effects */}
        <section className="glass p-8 rounded-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">CSS Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Float Effect */}
            <div className="glass-dark p-6 rounded-xl animate-float">
              <div className="text-4xl mb-2">🚀</div>
              <h3 className="text-white font-semibold mb-2">Float</h3>
              <p className="text-white/70 text-sm">Floating animation</p>
            </div>

            {/* Glow Effect */}
            <div className="glass-dark p-6 rounded-xl animate-glow">
              <div className="text-4xl mb-2">✨</div>
              <h3 className="text-white font-semibold mb-2">Glow</h3>
              <p className="text-white/70 text-sm">Pulsing glow effect</p>
            </div>

            {/* Gradient Animation */}
            <div
              className="p-6 rounded-xl animate-gradient"
              style={{
                background:
                  'linear-gradient(135deg, #667eea 0%, #764ba2 40%, #f093fb 70%, #f5576c 100%)',
              }}
            >
              <div className="text-4xl mb-2">🌈</div>
              <h3 className="text-white font-semibold mb-2">Gradient</h3>
              <p className="text-white/70 text-sm">Animated gradient</p>
            </div>
          </div>
        </section>

        {/* Glassmorphism & Neumorphism */}
        <section className="glass p-8 rounded-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">Design Styles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-xl">
              <h3 className="text-white font-semibold mb-2">Glassmorphism Light</h3>
              <p className="text-white/70 text-sm">
                Semi-transparent with backdrop blur
              </p>
            </div>

            <div className="glass-dark p-6 rounded-xl">
              <h3 className="text-white font-semibold mb-2">Glassmorphism Dark</h3>
              <p className="text-white/70 text-sm">
                Darker variant with backdrop blur
              </p>
            </div>
          </div>
        </section>

        {/* Parallax Effects */}
        <section className="glass p-8 rounded-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">Parallax Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div ref={parallaxRef} className="glass-dark p-6 rounded-xl">
              <h3 className="text-white font-semibold mb-2">Scroll Parallax</h3>
              <p className="text-white/70 text-sm">
                Moves with scroll (scroll to see effect)
              </p>
            </div>

            <div ref={mouseParallaxRef} className="glass-dark p-6 rounded-xl">
              <h3 className="text-white font-semibold mb-2">Mouse Parallax</h3>
              <p className="text-white/70 text-sm">
                Follows mouse movement
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnimationsDemo;
