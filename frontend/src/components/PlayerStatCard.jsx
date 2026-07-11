import React, { useState, useEffect } from 'react';
import { getWikimediaPlayerImage } from '../utils/wikimediaApi';

const PlayerStatCard = ({ player, statType, rank }) => {
  const [photoUrl, setPhotoUrl] = useState(player.photo);
  const [imgError, setImgError] = useState(false);
  
  const statKey = statType === 'topScorers' ? 'goals' :
                  statType === 'assists' ? 'assists' :
                  statType === 'yellowCards' ? 'yellowCards' :
                  statType === 'redCards' ? 'redCards' : 'cleanSheets';
                  
  const statValue = player[statKey];
  const isTop3 = rank <= 3;

  useEffect(() => {
    let isMounted = true;
    const fetchPhoto = async () => {
      // If the API provided a crest but it fails, or if it didn't provide one, fetch from wikimedia
      if (!player.photo || imgError) {
        const url = await getWikimediaPlayerImage(player.name, player.country);
        if (isMounted) {
          setPhotoUrl(url);
        }
      }
    };
    fetchPhoto();
    return () => { isMounted = false; };
  }, [player.name, player.country, player.photo, imgError]);

  const handleImgError = () => {
    if (!imgError) {
      setImgError(true);
      setPhotoUrl('/default-player.svg');
    }
  };

  return (
    <div className={`flex items-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border ${isTop3 ? 'border-yellow-400' : 'border-gray-100'}`}>
      
      {/* Rank */}
      <div className={`w-8 font-bold text-lg text-center mr-3 ${isTop3 ? 'text-yellow-500' : 'text-gray-400'}`}>
        #{rank}
      </div>

      {/* Avatar */}
      <img
        src={photoUrl || '/default-player.svg'}
        alt={player.name}
        onError={handleImgError}
        className="w-12 h-12 rounded-full object-cover border-2 border-gray-50 mr-4 flex-shrink-0 bg-gray-100"
      />

      {/* Info */}
      <div className="flex-1 min-w-0 mr-4">
        <h4 className="m-0 text-[15px] font-bold text-gray-800 truncate">
          {player.name}
        </h4>
        <div className="flex items-center text-[13px] text-gray-500 mt-0.5 truncate">
          <span className={`fi fi-${player.countryCode} mr-1.5 text-base rounded-[2px] overflow-hidden`}></span>
          <span className="truncate">{player.team}</span>
        </div>
      </div>

      {/* Stat Value */}
      <div className="text-right flex-shrink-0">
        <div className="text-2xl font-black text-gray-900 leading-none">
          {statValue}
        </div>
        <div className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-wider">
          Total
        </div>
      </div>
    </div>
  );
};

export default PlayerStatCard;
