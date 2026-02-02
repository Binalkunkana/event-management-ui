import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import "../styles/matdash-theme.css";

const DashboardChart = ({ data, title }) => {
    const colors = ['#5D87FF', '#49BEFF', '#13DEB9', '#FFAE1F', '#FA896B', '#539BFF'];

    return (
        <div className="matdash-card">
            <h3 className="matdash-card-title">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE5EF" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: '#5A6A85', fontSize: 12 }}
                        axisLine={{ stroke: '#DFE5EF' }}
                    />
                    <YAxis
                        tick={{ fill: '#5A6A85', fontSize: 12 }}
                        axisLine={{ stroke: '#DFE5EF' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #DFE5EF',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(145, 158, 171, 0.12)'
                        }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DashboardChart;
