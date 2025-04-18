'use client';

import { KajianData } from '../types/config';

interface AnnouncementProps {
  announcements: KajianData[];
}

export default function Announcement({ announcements }: AnnouncementProps) {
  return (
    <div className="mt-3 border-t border-[#E6D5C9]/10 pt-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-[#E6D5C9] animate-pulse"></div>
        <h3 className="text-sm md:text-base font-medium text-[#E6D5C9]">
          Info Kegiatan Masjid
        </h3>
      </div>
      <div className="space-y-2">
        {announcements.map((kajian) => (
          <div 
            key={kajian.id} 
            className="bg-[#2D3B35]/80 rounded-lg p-2.5 border border-[#E6D5C9]/20 hover:border-[#E6D5C9]/30 transition-colors"
          >
            <p className="text-sm md:text-base text-[#E6D5C9] font-medium">
              {kajian.text}
            </p>
            <p className="text-xs md:text-sm text-[#E6D5C9]/70 mt-1">
              {kajian.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF9D]/70"></span>
                <span className="text-xs text-[#E6D5C9]/70">{kajian.ustadz}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-[#E6D5C9]/30"></div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF9D]/70"></span>
                <span className="text-xs text-[#E6D5C9]/70">{kajian.schedule}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 