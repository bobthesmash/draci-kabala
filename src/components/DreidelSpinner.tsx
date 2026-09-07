import React from 'react';

interface DreidelSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DreidelSpinner: React.FC<DreidelSpinnerProps> = ({
  size = 'sm',
  className = ''
}) => {
  return (
    <div
      className={`dreidel-container size-${size} ${className}`}
      role="status"
      aria-label="Draigl se točí..."
      title="Draigl se točí (נ ג ה ש)"
    >
      <div className="dreidel-scaler">
        <div className="dreidel-viewport">
          <div className="dreidel-body">
            {/* Dřevěný kolíček nahoře */}
            <div className="dreidel-stem" />
            {/* Horní ploška těla */}
            <div className="dreidel-cap" />

            {/* 4 stěny těla s autentickými hebrejskými písmeny (Šin, Nun, Gimel, He) */}
            <div className="dreidel-face face-shin">ש</div>
            <div className="dreidel-face face-nun">נ</div>
            <div className="dreidel-face face-gimel">ג</div>
            <div className="dreidel-face face-he">ה</div>

            {/* 4 zkosené stěny dolního hrotu (jehlan) */}
            <div className="dreidel-tip-facet tip-shin" />
            <div className="dreidel-tip-facet tip-nun" />
            <div className="dreidel-tip-facet tip-gimel" />
            <div className="dreidel-tip-facet tip-he" />
          </div>
        </div>
        {/* Kontaktní stín pod točícím se hrotem */}
        <div className="dreidel-shadow" />
      </div>
    </div>
  );
};
