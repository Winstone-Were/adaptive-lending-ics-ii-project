'use client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

interface MousePosition {
  x: number;
  y: number;
}

export default function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
  const { user } = useAuth();
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY
      });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!user) return null;

  // Convert mouse position to SVG coordinates (0-1200, 0-800)
  const svgX = (mousePosition.x / window.innerWidth) * 1200;
  const svgY = (mousePosition.y / window.innerHeight) * 800;

  return (
    <div className="flex h-screen bg-[#EFF0F2]">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        {sidebar}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto relative">
        {/* Interactive Futuristic SVG Background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1200 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Grid Pattern */}
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#0D21A1" strokeWidth="1" opacity="0.4"/>
              </pattern>
              
              {/* Glow Effects */}
              <radialGradient id="cursorGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EEC643" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#EEC643" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#EEC643" stopOpacity="0" />
              </radialGradient>
              
              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0D21A1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0D21A1" stopOpacity="0" />
              </radialGradient>
              
              <linearGradient id="pulseGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EEC643" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#0D21A1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#011638" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Background Grid */}
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Cursor Interaction Area */}
            {isHovering && (
              <>
                {/* Main Cursor Glow */}
                <circle 
                  cx={svgX} 
                  cy={svgY} 
                  r="80" 
                  fill="url(#cursorGlow)" 
                >
                  <animate
                    attributeName="r"
                    values="80;100;80"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
                
                {/* Cursor Ring */}
                <circle
                  cx={svgX}
                  cy={svgY}
                  r="60"
                  fill="none"
                  stroke="#EEC643"
                  strokeWidth="2"
                  opacity="0.7"
                >
                  <animate
                    attributeName="r"
                    values="60;80;60"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                
                {/* Connection Lines from Cursor to Nodes */}
                <path
                  d={`M ${svgX} ${svgY} L 200 150`}
                  stroke="#EEC643"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  opacity="0.5"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;20"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
                
                <path
                  d={`M ${svgX} ${svgY} L 800 300`}
                  stroke="#EEC643"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  opacity="0.5"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;20"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
                
                <path
                  d={`M ${svgX} ${svgY} L 400 600`}
                  stroke="#EEC643"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  opacity="0.5"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;20"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
              </>
            )}

            {/* Interactive Nodes that respond to cursor */}
            <circle 
              cx="200" 
              cy="150" 
              r={isHovering && Math.abs(svgX - 200) < 200 && Math.abs(svgY - 150) < 200 ? "12" : "8"} 
              fill="url(#nodeGlow)" 
            >
              <animate
                attributeName="r"
                values="8;10;8"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            
            <circle 
              cx="800" 
              cy="300" 
              r={isHovering && Math.abs(svgX - 800) < 200 && Math.abs(svgY - 300) < 200 ? "16" : "12"} 
              fill="url(#nodeGlow)" 
            >
              <animate
                attributeName="r"
                values="12;14;12"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>
            
            <circle 
              cx="400" 
              cy="600" 
              r={isHovering && Math.abs(svgX - 400) < 200 && Math.abs(svgY - 600) < 200 ? "10" : "6"} 
              fill="url(#nodeGlow)" 
            >
              <animate
                attributeName="r"
                values="6;8;6"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
            
            <circle 
              cx="1000" 
              cy="500" 
              r={isHovering && Math.abs(svgX - 1000) < 200 && Math.abs(svgY - 500) < 200 ? "14" : "10"} 
              fill="url(#nodeGlow)" 
            >
              <animate
                attributeName="r"
                values="10;12;10"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            
            <circle 
              cx="600" 
              cy="200" 
              r={isHovering && Math.abs(svgX - 600) < 200 && Math.abs(svgY - 200) < 200 ? "11" : "7"} 
              fill="url(#nodeGlow)" 
            >
              <animate
                attributeName="r"
                values="7;9;7"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Data Flow Lines */}
            <path
              d="M 300 400 L 500 400"
              stroke="#EEC643"
              strokeWidth="2"
              opacity="0.6"
            >
              <animate
                attributeName="stroke-dasharray"
                values="0,100;100,0;0,100"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
            
            <path
              d="M 700 450 L 900 450"
              stroke="#EEC643"
              strokeWidth="2"
              opacity="0.6"
            >
              <animate
                attributeName="stroke-dasharray"
                values="0,100;100,0;0,100"
                dur="3s"
                repeatCount="indefinite"
                begin="1s"
              />
            </path>

            {/* Circuit Patterns with Hover Effects */}
            <path
              d="M 150 650 Q 250 600 350 650 T 550 650"
              stroke="#011638"
              strokeWidth={isHovering && Math.abs(svgY - 650) < 100 ? "3" : "2"}
              fill="none"
              opacity="0.4"
            />
            
            <path
              d="M 650 100 Q 750 150 850 100 T 1050 100"
              stroke="#011638"
              strokeWidth={isHovering && Math.abs(svgY - 100) < 100 ? "3" : "2"}
              fill="none"
              opacity="0.4"
            />

            {/* Wave Forms that follow cursor */}
            <path
              d={`M 100 250 Q ${svgX * 0.3} ${svgY * 0.3} 300 250 T 500 250 T 700 250 T 900 250 T 1100 250`}
              stroke="#0D21A1"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
            
            <path
              d={`M 50 550 Q ${svgX * 0.2} ${svgY * 0.8} 250 550 T 450 550 T 650 550 T 850 550 T 1050 550`}
              stroke="#0D21A1"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />

            {/* Binary Particles that move with cursor */}
            <text 
              x={180 + (svgX * 0.01)} 
              y={80 + (svgY * 0.01)} 
              fill="#EEC643" 
              opacity="0.5" 
              fontSize="14" 
              fontFamily="monospace"
            >
              1010
            </text>
            
            <text 
              x={950 - (svgX * 0.01)} 
              y={180 + (svgY * 0.01)} 
              fill="#EEC643" 
              opacity="0.5" 
              fontSize="14" 
              fontFamily="monospace"
            >
              1101
            </text>
            
            <text 
              x={350 + (svgX * 0.005)} 
              y={750 - (svgY * 0.005)} 
              fill="#EEC643" 
              opacity="0.5" 
              fontSize="14" 
              fontFamily="monospace"
            >
              0110
            </text>

            {/* Central Hub with enhanced interaction */}
            <circle 
              cx="600" 
              cy="400" 
              r={isHovering && Math.abs(svgX - 600) < 300 && Math.abs(svgY - 400) < 300 ? "50" : "40"} 
              fill="none" 
              stroke="url(#pulseGlow)" 
              strokeWidth="3" 
              opacity="0.6"
            >
              <animate 
                attributeName="r" 
                values={isHovering && Math.abs(svgX - 600) < 300 && Math.abs(svgY - 400) < 300 ? "50;55;50" : "40;45;40"} 
                dur="4s" 
                repeatCount="indefinite" 
              />
            </circle>

            {/* Enhanced Radar Sweep */}
            <path
              d="M 600 400 L 800 400"
              stroke="#EEC643"
              strokeWidth="2"
              opacity="0.4"
            >
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="0 600 400"
                to="360 600 400"
                dur="6s"
                repeatCount="indefinite"
              />
            </path>

            {/* Additional Particles that follow cursor */}
            {isHovering && (
              <>
                <circle
                  cx={svgX + 30}
                  cy={svgY - 20}
                  r="3"
                  fill="#EEC643"
                  opacity="0.6"
                >
                  <animate
                    attributeName="r"
                    values="3;5;3"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
                
                <circle
                  cx={svgX - 25}
                  cy={svgY + 15}
                  r="2"
                  fill="#0D21A1"
                  opacity="0.6"
                >
                  <animate
                    attributeName="r"
                    values="2;4;2"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              </>
            )}
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}