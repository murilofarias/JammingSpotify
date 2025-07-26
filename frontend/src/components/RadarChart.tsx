import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadar,
  ResponsiveContainer,
} from 'recharts';

interface Averages {
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
}

/**
 * Audio-features radar. Values are already in [0, 1] from the Spotify schema
 * (tempo is excluded here because it isn't on the same scale — we surface
 * tempo as a separate stat).
 */
export function RadarChart({ averages }: { averages: Averages }): JSX.Element {
  const data = [
    { axis: 'Dance', value: averages.danceability },
    { axis: 'Energy', value: averages.energy },
    { axis: 'Valence', value: averages.valence },
    { axis: 'Acoustic', value: averages.acousticness },
    { axis: 'Instr.', value: averages.instrumentalness },
    { axis: 'Speech', value: averages.speechiness },
  ];

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={data} outerRadius="75%">
          <PolarGrid gridType="polygon" />
          <PolarAngleAxis dataKey="axis" />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 1]}
            tick={false}
            axisLine={false}
          />
          <Radar
            dataKey="value"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.35}
            dot={{ fill: '#8b5cf6', r: 3 }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
