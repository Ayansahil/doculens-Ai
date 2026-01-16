import { supabase } from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const { data: allDocuments, error: allError } = await supabase
      .from('documents')
      .select('id, status, file_size, created_at, title, type, category, description, project');

    if (allError) throw allError;

    const totalDocuments = allDocuments?.length || 0;
    const analysedDocuments = allDocuments?.filter(doc => doc.status === 'analysed').length || 0;
    const highRiskDocuments = allDocuments?.filter(doc => doc.status === 'high-risk').length || 0;
    const pendingDocuments = allDocuments?.filter(doc => doc.status === 'pending').length || 0;

    const storageUsed = allDocuments?.reduce((total, doc) => total + (doc.file_size || 0), 0) || 0;
    const storageUsedGB = parseFloat((storageUsed / (1024 * 1024 * 1024)).toFixed(2));

    const recentDocuments = allDocuments?.slice(0, 5).map(doc => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      category: doc.category,
      status: doc.status === 'high-risk' ? 'High Risk' : doc.status === 'analysed' ? 'Analysed' : doc.status === 'pending' ? 'Pending' : doc.status,
      date: doc.created_at,
      description: doc.description || 'No description provided'
    })) || [];

    const recentActivity = allDocuments?.slice(0, 5).map((doc, index) => ({
      id: `activity-${doc.id}`,
      user: 'System',
      type: 'upload',
      document: doc.title,
      status: doc.status === 'high-risk' ? 'High Risk' : doc.status === 'analysed' ? 'Analysed' : 'Completed',
      time: getRelativeTime(doc.created_at)
    })) || [];

    res.json({
      totalDocuments,
      analysedDocuments,
      highRiskDocuments,
      pendingDocuments,
      storageUsed: storageUsedGB,
      totalStorage: 10,
      recentActivity,
      recentDocuments
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard stats',
      error: error.message,
      totalDocuments: 0,
      analysedDocuments: 0,
      highRiskDocuments: 0,
      pendingDocuments: 0,
      storageUsed: 0,
      totalStorage: 10,
      recentActivity: [],
      recentDocuments: []
    });
  }
};

export const getStorageInfo = async (req, res) => {
  try {
    const { data: documents, error } = await supabase
      .from('documents')
      .select('file_size');

    if (error) throw error;

    const totalUsed = documents?.reduce((total, doc) => total + (doc.file_size || 0), 0) || 0;
    const usedGB = parseFloat((totalUsed / (1024 * 1024 * 1024)).toFixed(2));
    const totalGB = 10;
    const percentage = parseFloat(((usedGB / totalGB) * 100).toFixed(2));

    res.json({
      used: usedGB,
      total: totalGB,
      percentage,
      available: parseFloat((totalGB - usedGB).toFixed(2))
    });
  } catch (error) {
    console.error('Storage info error:', error);
    res.status(500).json({
      message: 'Failed to fetch storage info',
      error: error.message,
      used: 0,
      total: 10,
      percentage: 0,
      available: 10
    });
  }
};

function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}
