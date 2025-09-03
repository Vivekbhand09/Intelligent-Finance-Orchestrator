import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import {addThousandsSeparator} from "../util/util.js";

const CustomLineChart = ({ data }) => {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;

            // Group items by category for the tooltip display
            const groupedItemsForTooltip = dataPoint.items.reduce((acc, item) => {
                const { categoryName, amount } = item;
                if (!acc[categoryName]) {
                    acc[categoryName] = {
                        categoryName: categoryName,
                        totalAmount: 0,
                    };
                }
                acc[categoryName].totalAmount += amount;
                return acc;
            }, {});

            // Convert grouped object to array for mapping
            const categoriesInTooltip = Object.values(groupedItemsForTooltip);

            return (
                <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
                    {/* Display the formatted date at the top of the tooltip */}
                    <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
                    <hr className="my-1 border-gray-200" />
                    {/* Display the total amount for the date */}
                    <p className="text-sm text-gray-700 font-bold mb-2">
                        Total: <span className="text-purple-800">&#8377;{addThousandsSeparator(dataPoint.totalAmount)}</span>
                    </p>

                    {/* Iterate over the newly grouped categories for a consolidated view */}
                    {categoriesInTooltip && categoriesInTooltip.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Details:</p>
                            {categoriesInTooltip.map((groupedItem, index) => (
                                <div key={index} className="flex justify-between text-xs text-gray-700">
                                    <span>{groupedItem.categoryName}:</span>
                                    <span>&#8377;{addThousandsSeparator(groupedItem.totalAmount)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white">
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#875cf5" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#875cf5" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid stroke="none" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#555" }} stroke="none" />
                    <YAxis tick={{ fontSize: 12, fill: "#555" }} stroke="none" />
                    <Tooltip content={<CustomTooltip />} />

                    <Area
                        type="monotone"
                        dataKey="totalAmount"
                        stroke="#875cf5"
                        fill="url(#expenseGradient)"
                        strokeWidth={3}
                        dot={{ r: 3, fill: "#ab8df8" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomLineChart;