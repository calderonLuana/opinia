import { PieChart, Pie, Cell } from 'recharts';

function SentimientosDonut({ data }) {
  const principal = data[0];

  return (
    <div className="donut-wrap">
      <div className="donut">
        <PieChart width={170} height={170}>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={54}
            outerRadius={80}
            paddingAngle={3}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {data.map((item) => (
              <Cell key={item.name} fill={item.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="donut-center">
          <strong>{principal.value}%</strong>
          <span>{principal.name}</span>
        </div>
      </div>

      <ul className="donut-legend">
        {data.map((item) => (
          <li key={item.name}>
            <span className="dot" style={{ backgroundColor: item.color }} />
            <span className="legend-name">{item.name}</span>
            <span className="legend-value">{item.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SentimientosDonut;