import React from 'react';

const Hero = () => {
  // Senior Move: Store particle configurations in an array to avoid repeating HTML 9 times.
  const particles = [
    { left: '10%', delay: '0s' },
    { left: '20%', delay: '1s' },
    { left: '30%', delay: '2s' },
    { left: '40%', delay: '3s' },
    { left: '50%', delay: '4s' },
    { left: '60%', delay: '5s' },
    { left: '70%', delay: '6s' },
    { left: '80%', delay: '7s' },
    { left: '90%', delay: '0.5s' }
  ];

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">

      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://img.freepik.com/free-vector/elegant-white-background-with-wave-design_1017-39102.jpg?semt=ais_user_personalization&w=740&q=80" 
          alt="background" 
          className="w-full h-full"
        />
      </div>
      
      {/* Gold particles rendered cleanly using a map function */}
      <div className="gold-particles z-0">
        {particles.map((particle, index) => (
          <div 
            key={index} 
            className="particle" 
            style={{ left: particle.left, animationDelay: particle.delay }}
          ></div>
        ))}
      </div>
      
      {/* Content */}
      <div className="hero-content relative z-10 text-center text-slate-900 px-6 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
          Lorem ipsum dolor sit.,<br />
          <span className="gold-gradient-text">Lorem, ipsum.</span>
        </h1>
        <p className="text-xl md:text-2xl mb-10 font-light text-slate-900 max-w-3xl mx-auto">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt, beatae!
        </p>
        <a href="/login" className="inline-block bg-slate-900 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-blue-200 text-black transition transform hover:scale-105 btn-pulse">
          Get Started
        </a>
      </div>
    </section>
  );
};

export default Hero;
