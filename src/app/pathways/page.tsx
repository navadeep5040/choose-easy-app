import Link from "next/link";

export default function PathwaysPage() {
  return (
    <main className="relative z-10 pt-32 pb-margin-page px-gutter max-w-container-max mx-auto">
      {/* Hero Header */}
      <header className="mb-stack-lg border-l-2 border-primary pl-gutter">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse emerald-glow"></span>
          <span className="font-mono-label text-mono-label text-secondary uppercase tracking-[0.2em]">System Online // Pathfinding Active</span>
        </div>
        <h1 className="font-h1 text-h1 font-jakarta mb-2">Career Trajectories</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">High-fidelity projection of industrial shifts and skill-evolution pathways based on neural-market analysis.</p>
      </header>
      
      {/* Bento Grid Pathways Layout */}
      <div className="grid grid-cols-12 gap-stack-md">
        {/* Path Visualization (The Interactive Graph Component) */}
        <section className="col-span-12 lg:col-span-8 glass-panel p-stack-md relative min-h-[500px] overflow-hidden">
          <div className="flex justify-between items-center mb-stack-md">
            <h3 className="font-h2 text-h2 font-jakarta text-primary">Interactive Graph</h3>
            <div className="flex gap-2">
              <button className="p-2 border border-outline-variant hover:border-primary transition-all">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
              </button>
              <button className="p-2 border border-outline-variant hover:border-primary transition-all">
                <span className="material-symbols-outlined text-outline">query_stats</span>
              </button>
            </div>
          </div>
          {/* Mock Graph Visualization */}
          <div className="relative h-full w-full flex items-center justify-center">
            {/* SVG Graph Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 800 400">
              <path d="M50 350 Q 200 300 400 150 T 750 50" fill="none" stroke="#4edea3" strokeDasharray="5,5" strokeWidth="2"></path>
              <path d="M50 300 Q 300 250 500 200 T 750 150" fill="none" stroke="#2fd9f4" strokeWidth="2"></path>
            </svg>
            {/* Nodes */}
            <div className="absolute top-[70%] left-[5%] group">
              <div className="w-4 h-4 bg-secondary rounded-full emerald-glow group-hover:scale-125 transition-transform cursor-pointer"></div>
              <div className="absolute top-6 left-0 glass-panel p-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                <span className="font-mono-label text-mono-label block text-secondary">Junior Dev</span>
                <span className="font-mono-label text-[10px] text-outline">Salary: $85k</span>
              </div>
            </div>
            <div className="absolute top-[40%] left-[45%] group">
              <div className="w-6 h-6 bg-primary-fixed-dim rounded-full shadow-[0_0_15px_rgba(47,217,244,0.6)] group-hover:scale-125 transition-transform cursor-pointer"></div>
              <div className="absolute top-8 left-[-50px] glass-panel p-3 opacity-100 transition-opacity z-20 border-glow-cyan">
                <span className="font-jakarta font-bold text-primary block">AI Architect</span>
                <span className="font-mono-label text-mono-label text-on-surface-variant">Pivot Probability: 84%</span>
              </div>
            </div>
            <div className="absolute top-[10%] left-[85%] group">
              <div className="w-4 h-4 bg-outline rounded-full group-hover:scale-125 transition-transform cursor-pointer"></div>
              <div className="absolute top-6 right-0 glass-panel p-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                <span className="font-mono-label text-mono-label block">CTO / Founder</span>
              </div>
            </div>
          </div>
          {/* Corner Crosshairs */}
          <div className="corner-marker top-0 left-0 border-t-2 border-l-2"></div>
          <div className="corner-marker top-0 right-0 border-t-2 border-r-2"></div>
          <div className="corner-marker bottom-0 left-0 border-b-2 border-l-2"></div>
          <div className="corner-marker bottom-0 right-0 border-b-2 border-r-2"></div>
        </section>
        
        {/* Top Predicted Paths */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-stack-md">
          <div className="glass-panel p-stack-md flex-1">
            <h3 className="font-h2 text-h2 font-jakarta mb-stack-md flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">trending_up</span>
              Top Predicted Paths
            </h3>
            <div className="space-y-stack-sm">
              {/* Path Card 1 */}
              <div className="p-stack-sm bg-surface-container-low border border-white/5 hover:border-secondary transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-jakarta font-semibold text-body-md group-hover:text-secondary transition-colors">Neural Engineer</span>
                  <span className="font-mono-label text-secondary">+12.4% MoM</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1 overflow-hidden">
                  <div className="bg-secondary h-full w-[78%]"></div>
                </div>
                <div className="mt-2 font-mono-label text-outline text-[10px] uppercase">Confidence: 98.2%</div>
              </div>
              {/* Path Card 2 */}
              <div className="p-stack-sm bg-surface-container-low border border-white/5 hover:border-primary transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-jakarta font-semibold text-body-md group-hover:text-primary transition-colors">DeFi Analyst</span>
                  <span className="font-mono-label text-primary">+8.1% MoM</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1 overflow-hidden">
                  <div className="bg-primary h-full w-[64%]"></div>
                </div>
                <div className="mt-2 font-mono-label text-outline text-[10px] uppercase">Confidence: 91.5%</div>
              </div>
              {/* Path Card 3 */}
              <div className="p-stack-sm bg-surface-container-low border border-white/5 hover:border-tertiary transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-jakarta font-semibold text-body-md group-hover:text-tertiary transition-colors">UX Cognition Specialist</span>
                  <span className="font-mono-label text-tertiary">+5.9% MoM</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1 overflow-hidden">
                  <div className="bg-tertiary h-full w-[42%]"></div>
                </div>
                <div className="mt-2 font-mono-label text-outline text-[10px] uppercase">Confidence: 85.0%</div>
              </div>
            </div>
          </div>
          
          {/* Skill Gap Analysis */}
          <div className="glass-panel p-stack-md bg-secondary/5 border-secondary/20 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-secondary/10 rounded-full blur-3xl"></div>
            <h3 className="font-h2 text-h2 font-jakarta mb-stack-md text-secondary">Skill Gap Analysis</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container border border-secondary/30">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
                <div>
                  <p className="font-jakarta font-bold text-body-md">Cloud Architecture</p>
                  <p className="font-mono-label text-outline uppercase">Critical Deficiency Identified</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container border border-primary/30">
                  <span className="material-symbols-outlined text-primary">data_object</span>
                </div>
                <div>
                  <p className="font-jakarta font-bold text-body-md">Vector Databases</p>
                  <p className="font-mono-label text-outline uppercase">Emerging Requirement</p>
                </div>
              </div>
              <Link href="/dashboard/chat?intent=training_plan" className="block w-full mt-4 py-3 bg-secondary text-on-secondary-container font-mono-label text-mono-label font-bold tracking-[0.2em] uppercase text-center hover:shadow-[0_0_20px_rgba(78,222,163,0.4)] transition-all">
                Generate Training Plan
              </Link>
            </div>
          </div>
        </section>
        
        {/* Detail Analysis Section */}
        <section className="col-span-12 glass-panel p-stack-lg flex flex-col md:flex-row gap-stack-lg items-center">
          <div className="flex-1">
            <h2 className="font-h2 text-h2 font-jakarta mb-4">Industrial Displacement Index</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Our algorithms track the displacement of traditional roles by autonomous agents in real-time. Stay ahead of the curve by identifying "Safe-Zones" and high-growth "Hybrid-Zones" where human oversight remains mandatory.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-md">
              <div className="text-center p-4 border border-outline-variant bg-surface-container-lowest">
                <div className="font-h2 text-h2 text-primary font-jakarta">92%</div>
                <div className="font-mono-label text-outline uppercase">Accuracy Rate</div>
              </div>
              <div className="text-center p-4 border border-outline-variant bg-surface-container-lowest">
                <div className="font-h2 text-h2 text-secondary font-jakarta">1.4M</div>
                <div className="font-mono-label text-outline uppercase">Data Points</div>
              </div>
              <div className="text-center p-4 border border-outline-variant bg-surface-container-lowest">
                <div className="font-h2 text-h2 text-tertiary font-jakarta">400+</div>
                <div className="font-mono-label text-outline uppercase">Sector Maps</div>
              </div>
              <div className="text-center p-4 border border-outline-variant bg-surface-container-lowest">
                <div className="font-h2 text-h2 text-on-surface font-jakarta">24/7</div>
                <div className="font-mono-label text-outline uppercase">Neural Sync</div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 aspect-square glass-panel border-glow-cyan relative overflow-hidden p-2">
            <img className="w-full h-full object-cover opacity-60" alt="Futuristic circuit board" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAicqucjVavAnmNB0S7bDAXLsy9Qj0nd9bshf0U_W3gfnzrPlmBWJ4lcALxeEmfiNeV15ZKuVfC9jYWi-PyD3zUL9UNo2LV3q-vtwqgs6TTCXBDh06QCxIE0K_gs2vsAh9wdS8NRtR8EpAjFjVMLP5ZKp3JUNpm8MVAxm8IU9y9Z9puhAZeg7KO9vZuIVIGEBXOCo18LPHVoiQg_rYht83KBDgQLGsOy2P75a9a0JDFta-u9cWU7NifgCFh2-agtVk3DbHJUAKgm2o" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <span className="font-mono-label text-secondary text-[10px] block mb-1">SYSTEM_CORE // LOADED</span>
              <div className="h-1 w-24 bg-surface-container-highest">
                <div className="h-full bg-secondary w-2/3"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
