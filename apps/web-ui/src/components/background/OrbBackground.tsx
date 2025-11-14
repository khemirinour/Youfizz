const sparkles = [
  { className: "top-[15%] left-[10%]", size: "h-3 w-3", opacity: "bg-primary/60", blur: "blur-sm", delay: "0s" },
  { className: "top-[25%] left-[85%]", size: "h-2 w-2", opacity: "bg-primary/50", blur: "blur-sm", delay: "0.5s" },
  { className: "top-[35%] right-[15%]", size: "h-4 w-4", opacity: "bg-primary/40", blur: "blur-md", delay: "1s" },
  { className: "top-[45%] left-[20%]", size: "h-2 w-2", opacity: "bg-primary/55", blur: "blur-sm", delay: "1.5s" },
  { className: "top-[55%] right-[25%]", size: "h-3 w-3", opacity: "bg-primary/45", blur: "blur-sm", delay: "2s" },
  { className: "top-[65%] left-[70%]", size: "h-2 w-2", opacity: "bg-primary/50", blur: "blur-sm", delay: "0.8s" },
  { className: "top-[75%] left-[30%]", size: "h-4 w-4", opacity: "bg-primary/35", blur: "blur-md", delay: "1.2s" },
  { className: "bottom-[20%] right-[40%]", size: "h-3 w-3", opacity: "bg-primary/60", blur: "blur-sm", delay: "1.8s" },
  { className: "bottom-[15%] left-[50%]", size: "h-2 w-2", opacity: "bg-primary/45", blur: "blur-sm", delay: "2.5s" },
  { className: "top-[10%] right-[30%]", size: "h-3 w-3", opacity: "bg-primary/50", blur: "blur-md", delay: "0.3s" },
  { className: "top-[40%] left-[5%]", size: "h-2 w-2", opacity: "bg-primary/55", blur: "blur-sm", delay: "1.7s" },
  { className: "bottom-[30%] right-[10%]", size: "h-4 w-4", opacity: "bg-primary/40", blur: "blur-md", delay: "2.2s" },
  { className: "top-[8%] left-[32%]", size: "h-2 w-2", opacity: "bg-primary/40", blur: "blur-sm", delay: "0.6s" },
  { className: "bottom-[8%] left-[18%]", size: "h-3 w-3", opacity: "bg-primary/45", blur: "blur-md", delay: "2.8s" },
  { className: "bottom-[22%] left-[12%]", size: "h-2 w-2", opacity: "bg-primary/50", blur: "blur-sm", delay: "1.1s" },
  { className: "top-[18%] right-[12%]", size: "h-3 w-3", opacity: "bg-primary/45", blur: "blur-md", delay: "0.9s" },
  { className: "top-[52%] left-[45%]", size: "h-4 w-4", opacity: "bg-primary/30", blur: "blur-md", delay: "1.4s" },
  { className: "bottom-[42%] right-[32%]", size: "h-2 w-2", opacity: "bg-primary/55", blur: "blur-sm", delay: "2.1s" },
  { className: "top-[58%] right-[5%]", size: "h-3 w-3", opacity: "bg-primary/45", blur: "blur-md", delay: "1.9s" },
  { className: "bottom-[12%] right-[55%]", size: "h-2 w-2", opacity: "bg-primary/50", blur: "blur-sm", delay: "2.6s" },
];

const OrbBackground = () => {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-80"
        style={{ background: "radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.18), transparent 55%), radial-gradient(circle at 80% 10%, hsl(var(--primary) / 0.12), transparent 60%), radial-gradient(circle at 50% 80%, hsl(var(--primary) / 0.1), transparent 65%)" }}
      />
      <div className="absolute top-1/4 left-1/4 h-[26rem] w-[26rem] rounded-full bg-primary/10 blur-3xl animate-float" />
      <div
        className="absolute bottom-1/4 right-1/4 h-[24rem] w-[24rem] rounded-full bg-primary/5 blur-3xl animate-float"
        style={{ animationDelay: "1s" }}
      />

      {sparkles.map((sparkle, index) => (
        <div
          key={`sparkle-${index}`}
          className={`absolute ${sparkle.className} ${sparkle.size} ${sparkle.opacity} ${sparkle.blur} animate-pulse`}
          style={{ animationDelay: sparkle.delay }}
        />
      ))}
    </div>
  );
};

export default OrbBackground;

