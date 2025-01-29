"use client";

const BackgroundGradient = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-zinc-950">
      <div className="absolute inset-0 overflow-hidden mix-blend-normal"> {/* Ajout de mix-blend-normal */}
        <div 
          className="absolute top-0 -left-1/3 w-2/3 h-full 
          bg-gradient-to-r from-violet-500/20 to-transparent  
          blur-3xl animate-first"
        />
        
        <div 
          className="absolute top-0 -right-1/3 w-2/3 h-full
          bg-gradient-to-l from-violet-600/20 to-transparent  
          blur-3xl animate-second"
        />

        <div 
          className="absolute inset-x-0 -top-1/3 h-2/3
          bg-gradient-to-b from-violet-400/20 to-transparent
          blur-3xl animate-third"
        />

        <div 
          className="absolute inset-x-0 -bottom-1/3 h-2/3
          bg-gradient-to-t from-violet-500/20 to-transparent 
          blur-3xl animate-fourth"
        />
      </div>
    </div>
  );
};

export default BackgroundGradient;