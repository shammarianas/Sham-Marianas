import React, { useState, useEffect, useMemo } from "react";
import {
  FiTrendingUp,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiDownload,
  FiEye,
  FiBarChart2,
  FiPieChart,
  FiRefreshCw,
  FiClock,
  FiUsers,
  FiStar,
  FiArrowUp,
  FiArrowDown,
  FiExternalLink
} from "react-icons/fi";

const SearchTrends = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d, 1y
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");

  // Mock data for search trends (in real app, this would come from API)
  const mockTrendsData = [
    {
      id: 1,
      keyword: "3D models",
      category: "3d_model",
      popularity: 95,
      growth: 12.5,
      volume: 12500,
      competition: "medium",
      relatedKeywords: ["3d assets", "3d objects", "3d design"],
      trendData: [65, 70, 75, 80, 85, 90, 95],
      seasonality: "high",
      lastUpdated: "2024-01-15"
    },
    {
      id: 2,
      keyword: "Textures",
      category: "texture",
      popularity: 88,
      growth: 8.3,
      volume: 8900,
      competition: "high",
      relatedKeywords: ["surface textures", "material textures", "pattern"],
      trendData: [70, 72, 75, 78, 82, 85, 88],
      seasonality: "medium",
      lastUpdated: "2024-01-15"
    },
    {
      id: 3,
      keyword: "Background music",
      category: "audio",
      popularity: 82,
      growth: 15.2,
      volume: 7200,
      competition: "low",
      relatedKeywords: ["background audio", "music loops", "ambient sound"],
      trendData: [60, 65, 68, 72, 76, 80, 82],
      seasonality: "low",
      lastUpdated: "2024-01-15"
    },
    {
      id: 4,
      keyword: "Character models",
      category: "3d_model",
      popularity: 78,
      growth: 22.1,
      volume: 5400,
      competition: "medium",
      relatedKeywords: ["3d characters", "avatar models", "game characters"],
      trendData: [50, 55, 60, 65, 70, 75, 78],
      seasonality: "high",
      lastUpdated: "2024-01-15"
    },
    {
      id: 5,
      keyword: "PBR materials",
      category: "texture",
      popularity: 76,
      growth: 18.7,
      volume: 4800,
      competition: "low",
      relatedKeywords: ["pbr textures", "physically based rendering", "material"],
      trendData: [45, 50, 55, 60, 65, 70, 76],
      seasonality: "medium",
      lastUpdated: "2024-01-15"
    },
    {
      id: 6,
      keyword: "Sound effects",
      category: "audio",
      popularity: 72,
      growth: 9.4,
      volume: 6200,
      competition: "medium",
      relatedKeywords: ["sfx", "audio effects", "sound design"],
      trendData: [58, 60, 62, 65, 68, 70, 72],
      seasonality: "low",
      lastUpdated: "2024-01-15"
    },
    {
      id: 7,
      keyword: "Architecture models",
      category: "3d_model",
      popularity: 68,
      growth: 14.3,
      volume: 3800,
      competition: "high",
      relatedKeywords: ["architectural visualization", "building models", "3d architecture"],
      trendData: [40, 45, 50, 55, 60, 65, 68],
      seasonality: "medium",
      lastUpdated: "2024-01-15"
    },
    {
      id: 8,
      keyword: "UI sounds",
      category: "audio",
      popularity: 65,
      growth: 25.8,
      volume: 2900,
      competition: "low",
      relatedKeywords: ["interface sounds", "ui audio", "click sounds"],
      trendData: [35, 40, 45, 50, 55, 60, 65],
      seasonality: "high",
      lastUpdated: "2024-01-15"
    }
  ];

  // Categories for filtering
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "3d_model", label: "3D Models" },
    { value: "texture", label: "Textures" },
    { value: "audio", label: "Audio" }
  ];

  // Time ranges
  const timeRanges = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "1y", label: "Last year" }
  ];

  // Sort options
  const sortOptions = [
    { value: "popularity", label: "Popularity" },
    { value: "growth", label: "Growth Rate" },
    { value: "volume", label: "Search Volume" },
    { value: "competition", label: "Competition" }
  ];

  useEffect(() => {
    // Simulate API call
    const loadTrends = async () => {
      setLoading(true);
      try {
        // In real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTrends(mockTrendsData);
      } catch (error) {
        console.error("Error loading trends:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrends();
  }, [timeRange]);

  // Filter and sort trends
  const filteredTrends = useMemo(() => {
    let filtered = [...trends];

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter(trend => trend.category === category);
    }

    // Sort trends
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return b.popularity - a.popularity;
        case "growth":
          return b.growth - a.growth;
        case "volume":
          return b.volume - a.volume;
        case "competition":
          const competitionOrder = { low: 3, medium: 2, high: 1 };
          return competitionOrder[b.competition] - competitionOrder[a.competition];
        default:
          return b.popularity - a.popularity;
      }
    });

    return filtered;
  }, [trends, category, sortBy]);

  // Calculate overall metrics
  const metrics = useMemo(() => {
    if (trends.length === 0) return {};

    const totalVolume = trends.reduce((sum, trend) => sum + trend.volume, 0);
    const avgGrowth = trends.reduce((sum, trend) => sum + trend.growth, 0) / trends.length;
    const highGrowthTrends = trends.filter(trend => trend.growth > 15).length;

    return {
      totalVolume: Math.round(totalVolume).toLocaleString(),
      avgGrowth: avgGrowth.toFixed(1),
      highGrowthTrends,
      totalTrends: trends.length
    };
  }, [trends]);

  const getCompetitionColor = (competition) => {
    switch (competition) {
      case "low": return "#10b981";
      case "medium": return "#f59e0b";
      case "high": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getCompetitionText = (competition) => {
    switch (competition) {
      case "low": return "Low";
      case "medium": return "Medium";
      case "high": return "High";
      default: return "Unknown";
    }
  };

  const getSeasonalityIcon = (seasonality) => {
    switch (seasonality) {
      case "high": return "📈";
      case "medium": return "➡️";
      case "low": return "📉";
      default: return "➡️";
    }
  };

  const getGrowthIcon = (growth) => {
    return growth > 0 ? <FiArrowUp className="text-green-500" /> : <FiArrowDown className="text-red-500" />;
  };

  const renderTrendSparkline = (trendData) => {
    const maxValue = Math.max(...trendData);
    const minValue = Math.min(...trendData);
    const range = maxValue - minValue;

    return (
      <div className="sparkline-container">
        <div className="sparkline">
          {trendData.map((value, index) => {
            const height = range > 0 ? ((value - minValue) / range) * 100 : 50;
            return (
              <div
                key={index}
                className="sparkline-bar"
                style={{
                  height: `${height}%`,
                  backgroundColor: value === maxValue ? '#3b82f6' : '#dbeafe'
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const exportTrendsData = () => {
    const dataStr = JSON.stringify(filteredTrends, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `search-trends-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="user-reports-dashboard">
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading search trends...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-reports-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="header-title">
            <FiTrendingUp className="header-icon" />
            Search Trends Analytics
          </h2>
          <p className="header-subtitle">
            Discover popular search terms and market opportunities for your content
          </p>
        </div>
        <div className="header-actions">
          <span className="user-badge-count">
            {metrics.totalTrends} trending keywords
          </span>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="reports-stats-grid">
        <div className="report-stat-card primary">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiSearch />
            </div>
            <div>
              <h3 className="report-stat-title">Total Search Volume</h3>
              <div className="report-stat-value">{metrics.totalVolume}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Monthly search queries
            </div>
            <div className="report-stat-trend positive">
              +12.8% <FiTrendingUp />
            </div>
          </div>
        </div>

        <div className="report-stat-card success">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiTrendingUp />
            </div>
            <div>
              <h3 className="report-stat-title">Avg. Growth Rate</h3>
              <div className="report-stat-value">{metrics.avgGrowth}%</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Monthly growth average
            </div>
            <div className="report-stat-trend positive">
              +5.2% <FiTrendingUp />
            </div>
          </div>
        </div>

        <div className="report-stat-card warning">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiStar />
            </div>
            <div>
              <h3 className="report-stat-title">High Growth Trends</h3>
              <div className="report-stat-value">{metrics.highGrowthTrends}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Trends growing 15% monthly
            </div>
            <div className="report-stat-trend positive">
              +3 <FiTrendingUp />
            </div>
          </div>
        </div>

        <div className="report-stat-card info">
          <div className="report-stat-header">
            <div className="report-stat-icon">
              <FiUsers />
            </div>
            <div>
              <h3 className="report-stat-title">Market Coverage</h3>
              <div className="report-stat-value">{categories.length - 1}</div>
            </div>
          </div>
          <div className="report-stat-content">
            <div className="report-stat-subtext">
              Content categories tracked
            </div>
            <div className="report-stat-trend positive">
              100% <FiTrendingUp />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="reports-filter-bar">
        <div className="filter-bar-header">
          <h3 className="filter-bar-title">
            <FiFilter className="panel-icon" /> Filter Trends
          </h3>
          <div className="filter-results">
            <span className="filter-text">
              Showing {filteredTrends.length} of {trends.length} trends
            </span>
          </div>
        </div>

        <div className="filter-controls-grid">
          <select
            className="filter-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                Sort by: {option.label}
              </option>
            ))}
          </select>

          <div className="filter-actions">
            <button className="filter-button" onClick={exportTrendsData}>
              <FiDownload /> Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Trends Grid */}
      <div className="trends-grid">
        {filteredTrends.map(trend => (
          <div key={trend.id} className="trend-card">
            <div className="trend-header">
              <div className="trend-title-section">
                <h3 className="trend-keyword">{trend.keyword}</h3>
                <span className={`trend-category ${trend.category}`}>
                  {trend.category === "3d_model" && "3D Model"}
                  {trend.category === "texture" && "Texture"}
                  {trend.category === "audio" && "Audio"}
                </span>
              </div>
              <div className="trend-metrics">
                <div className="trend-metric">
                  <span className="metric-label">Popularity</span>
                  <span className="metric-value popularity">{trend.popularity}</span>
                </div>
              </div>
            </div>

            <div className="trend-sparkline">
              {renderTrendSparkline(trend.trendData)}
              <div className="sparkline-labels">
                <span>7 days trend</span>
              </div>
            </div>

            <div className="trend-details">
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">Search Volume</span>
                  <span className="detail-value">{trend.volume.toLocaleString()}/month</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Growth</span>
                  <span className={`detail-value ${trend.growth > 0 ? 'positive' : 'negative'}`}>
                    {getGrowthIcon(trend.growth)} {trend.growth}%
                  </span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">Competition</span>
                  <span 
                    className="detail-value competition"
                    style={{ color: getCompetitionColor(trend.competition) }}
                  >
                    {getCompetitionText(trend.competition)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Seasonality</span>
                  <span className="detail-value">
                    {getSeasonalityIcon(trend.seasonality)} {trend.seasonality}
                  </span>
                </div>
              </div>
            </div>

            <div className="trend-footer">
              <div className="related-keywords">
                <span className="related-label">Related: </span>
                {trend.relatedKeywords.slice(0, 2).map((keyword, idx) => (
                  <span key={idx} className="related-keyword">
                    {keyword}
                  </span>
                ))}
                {trend.relatedKeywords.length > 2 && (
                  <span className="related-more">
                    +{trend.relatedKeywords.length - 2} more
                  </span>
                )}
              </div>
              <button className="action-button secondary small">
                <FiEye /> Analyze
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Insights Section */}
      <div className="reports-content-grid">
        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3 className="panel-title">
              <FiBarChart2 className="panel-icon" /> Market Insights
            </h3>
          </div>
          <div className="reports-chart-body">
            <div className="insights-list">
              <div className="insight-item positive">
                <div className="insight-icon">💡</div>
                <div className="insight-content">
                  <h4>3D Models Dominance</h4>
                  <p>3D content shows 45% higher growth rate compared to other categories</p>
                </div>
              </div>
              <div className="insight-item warning">
                <div className="insight-icon">⚡</div>
                <div className="insight-content">
                  <h4>Audio Content Opportunity</h4>
                  <p>Audio assets have low competition with 25% monthly growth potential</p>
                </div>
              </div>
              <div className="insight-item info">
                <div className="insight-icon">🎯</div>
                <div className="insight-content">
                  <h4>Seasonal Trends</h4>
                  <p>Character models and UI sounds show high seasonal demand patterns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="reports-categories-card">
          <div className="reports-categories-header">
            <h3 className="panel-title">
              <FiPieChart className="panel-icon" /> Category Distribution
            </h3>
          </div>
          <div className="reports-categories-body">
            <div className="category-breakdown">
              {categories.filter(cat => cat.value !== 'all').map(category => {
                const categoryTrends = trends.filter(t => t.category === category.value);
                const percentage = (categoryTrends.length / trends.length) * 100;
                return (
                  <div key={category.value} className="category-item">
                    <div className="category-header">
                      <span className="category-name">{category.label}</span>
                      <span className="category-count">
                        {Math.round(percentage)}% ({categoryTrends.length})
                      </span>
                    </div>
                    <div className="category-progress-bar">
                      <div
                        className={`category-progress-fill ${category.value}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .user-reports-dashboard {
          padding: 20px;
          position: relative;
          min-height: 100vh;
        }

        /* Trends Grid */
        .trends-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .trend-card {
          background: var(--gray-dark);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .trend-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-color: #3b82f6;
        }

        .trend-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .trend-title-section {
          flex: 1;
        }

        .trend-keyword {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .trend-category {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .trend-category.texture {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
          border-color: rgba(139, 92, 246, 0.2);
        }

        .trend-category.audio {
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
          border-color: rgba(6, 182, 212, 0.2);
        }

        .trend-metrics {
          text-align: right;
        }

        .trend-metric {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .metric-label {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .metric-value.popularity {
          font-size: 24px;
          font-weight: 700;
          color: #3b82f6;
        }

        /* Sparkline */
        .trend-sparkline {
          margin: 16px 0;
          padding: 12px;
          background: var(--darker);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .sparkline-container {
          display: flex;
          align-items: flex-end;
          height: 40px;
          gap: 2px;
        }

        .sparkline {
          display: flex;
          align-items: flex-end;
          height: 100%;
          gap: 2px;
          flex: 1;
        }

        .sparkline-bar {
          flex: 1;
          border-radius: 2px;
          transition: all 0.3s ease;
          min-height: 2px;
        }

        .sparkline-labels {
          text-align: center;
          margin-top: 4px;
        }

        .sparkline-labels span {
          font-size: 11px;
          color: var(--text-secondary);
        }

        /* Trend Details */
        .trend-details {
          margin-bottom: 16px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 2px;
        }

        .detail-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .detail-value.positive {
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .detail-value.negative {
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .detail-value.competition {
          font-weight: 700;
        }

        /* Trend Footer */
        .trend-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
        }

        .related-keywords {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
          flex: 1;
        }

        .related-label {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .related-keyword {
          font-size: 11px;
          padding: 2px 6px;
          background: var(--darker);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }

        .related-more {
          font-size: 11px;
          color: var(--text-secondary);
          font-style: italic;
        }

        /* Insights */
        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .insight-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .insight-item.positive {
          border-left-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .insight-item.warning {
          border-left-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
        }

        .insight-item.info {
          border-left-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .insight-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .insight-content h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .insight-content p {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
        }

        /* Category Breakdown */
        .category-breakdown {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .category-item {
          padding: 8px 0;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .category-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .category-count {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .category-progress-fill {
          height: 6px;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .category-progress-fill.3d_model {
          background: #3b82f6;
        }

        .category-progress-fill.texture {
          background: #8b5cf6;
        }

        .category-progress-fill.audio {
          background: #06b6d4;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .trends-grid {
            grid-template-columns: 1fr;
          }

          .trend-header {
            flex-direction: column;
            gap: 12px;
          }

          .trend-metrics {
            align-self: flex-start;
          }

          .detail-row {
            flex-direction: column;
            gap: 8px;
          }

          .trend-footer {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .related-keywords {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchTrends;