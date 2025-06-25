export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  timestamp?: string
}

export interface ErrorResponse {
  status: number
  message: string
  details?: string[]
  errorId?: string
}

export interface User {
  userId: number
  username: string
  phone: string
}

export interface Worker {
  workerId: number
  workerName: string
  specialty: string
  hourlyWage: number
  baseSalary: number
  totalEarnings: number
  // admin
  status: string
  currentOrders: number
  completedOrders: number
}

export interface Vehicle {
  vehicleId: number
  licensePlate: string
  brand: string
  model: string
  year: number
  vin: string
}

export interface RepairOrder {
  orderId: number
  issue: string
  status: string
  vehicleId: number
  licensePlate: string
  workerId?: number
  workerName?: string
  createTime: string
  assignTime?: string
  estimatedCompletionTime?: string
  repairType?: string
  repairSolution?: string
  repairResult?: string
  feedbackId?: number
  hasFeedback?: boolean
  // worker
  vehicleInfo: {
    licensePlate: string;
    brand: string;
    model: string;
  };
  customerPhone?: string
  // admin
  priority?: string
  notes: string
  estimatedHours: number
}

export interface RepairLog {
  logId: number
  orderId: number
  vehicleId: number
  licensePlate: string
  issue: string
  repairDescription: string
  repairResult: string
  materialsCost: number
  laborCost: number
  totalCost: number
  total: number
  workerName: string
  submitTime: string
  completionTime: string
  rating: number
  // worker
  vehicleInfo: {
    licensePlate: string;
    brand: string;
    model: string;
  };
  laborHours?: number
  completeTime?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  confirmedPassword: string
  phone: string
}

export interface LoginResponse {
  token: string
  id: number
  username: string
  role: string
}

export interface Material {
  materialId: number
  orderId: number
  name: string
  quantity: number
  unitPrice: number
  totalCost: number
  supplier: string
}

export interface Feedback {
  id: number
  OrderId: number
  rating: number
  content: string
  category: string
  submitTime: string
}

export interface SubmitRepairRequest {
  vehicleId: number
  issue: string
  repairType: string
  additionalInfo?: string
}

export interface ProcessOrderRes {
  id: number
  status: string
  acceptTime?: string
  rejectTime?: string
  completeTime?: string
  laborHours?: number
  laborCost?: number
  totalCost?: number
}

export interface MonthlyEarning {
  month: number;
  year: number;
  totalSalary: number;
  baseSalary: number;
  hourlyCompensation: number;
  totalWorkHours: number;
  settlementStatus: string;
}

export interface YearlyEarning {
  year: number;
  totalSalary: number;
  baseSalary: number;
  hourlyCompensation: number;
  totalWorkHours: number;
  monthlyEarnings: MonthlyEarning[];
}

export interface WorkerEarning {
  workerId: number;
  workerName: string;
  specialty: string;
  hourlyWage: number;
  baseSalary: number;
  totalEarnings: number;
  yearlyEarnings: YearlyEarning[];
}
export interface WorkerPerformance {
  workerId: number
  workerName: string
  specialty: string
  completedOrders: number
  totalHours: number
  totalEarnings: number
  efficiency: number
  totalLaborCost: number
  completionRate: number
  customerSatisfaction: number
  averageCompletionTime: number
  totalWorkHours: number
  OnTimeCompletionRate: number
}

export interface BatchSubmitOrders {
  totalSubmitted: number
  successfullyCreated: number
  failed: number
  createOrderIds: number[]
  failureReasons?: string[]
}

export interface MonthlySettlement {
  id: number;
  workerId: number;
  workerName: string;
  specialty: string;
  totalHours: number;
  hourlyWage: number;
  totalHourlyWage: number;
  baseSalary: number;
  totalSalary: number;
  settlementYear: number;
  settlementMonth: number;
  settlementData: string;
  settlementStatus: string;
}

export interface Settlement {
  monthlySettlements: MonthlySettlement[];
}

export interface VehicleTypeStats {
  summary: {
    totalRepairs: number
    totalVehicleTypes: number
    dateRange: string
  }
  vehicleTypeStats: {
    vehicleType: string
    repairCount: number
    percentage: number
    averageCost: number
    repairFrequency: string
    trend: {
      month: string
      count: number
    }[]
    commonIssues: {
      issueType: string
      count: number
      percentage: number
    }[]
  }[]
}

export interface CostAnalysis {
  period: string;
  totalCost: number;
  laborCost: number;
  laborCostPercentage: number;
  materialCost: number;
  materialCostPercentage: number;
  averageCostPerOrder: number;
  costTrend: {
    category: string;
    totalCost: number;
    laborCost: number;
    materialCost: number;
  }[];
  costByRepairType: {
    repairType: string;
    totalCost: number;
    laborCost: number;
    materialCost: number;
    averageCostPerOrder: number;
  }[];
}

export interface WorkerStats {
  workerId: number
  workerName: string
  negativeFeedbackCount: number
  totalFeedbackCount: number
  negativeRatio: number
}

export interface NegativeFeedback {
  total: number;
  averageSeverity: number;
  feedbacks: {
    orderId: number;
    feedbackId: number;
    feedbackDate: string;
    severity: number;
    comment: string;
    category: string;
    worker: {
      id: number;
      name: string;
      specialty: string;
      negativeOrderCount: number;
    };
    vehicle: {
      id: number | null;
      licensePlate: string | null;
      type: string;
    };
    resolution: {
      status: string;
      actionTaken: string;
      resolvedDate: string | null;
    };
  }[];
  categories: {
    category: string;
    count: number;
    percentage: number;
  }[];
  workerStats: {
    workerId: number;
    workerName: string;
    negativeCount: number;
    averageSeverity: number;
    percentage: number;
  }[];
}

export interface SpecialtyWorkloadStat {
  specialty: string;
  assignedCount: number;
  completedCount: number;
  rejectedCount: number;
  inProgressCount: number;
  assignedPercentage: number;
  completedPercentage: number;
  averageCompletionTime: string;
  averageCost: number;
  workers: number;
  orderPerWorker: number;
  trend: {
    month: string;
    assigned: number;
    completed: number;
  }[];
}

export interface SpecialtyWorkloadRecommendation {
  specialty: string;
  recommendedHires: number;
  reason: string;
}

export interface SpecialtyWorkloadStats {
  totalOrders: number;
  dateRange: string;
  specialtyStats: SpecialtyWorkloadStat[];
  recommendations: {
    recruiting: SpecialtyWorkloadRecommendation[];
  };
}

export interface PendingTasks {
  totalPendingTasks: number;
  byStatus: {
    [status: string]: number;
  };
  bySpecialty: {
    specialty: string;
    pendingCount: number;
    workers: {
      workerId: number;
      workerName: string;
      pendingTasks: number;
    }[];
  }[];
  byVehicle: {
    brand: string;
    model: string;
    pendingCount: number;
  }[];
}

export interface RollBack {
    orderId: number
    previousStatus: string
    currentStatus: string
    rollbackTime: string
    reason: string
}

export interface BatchDeleteOrders {
    totalRequested: number
    successfullyDeleted: number
    failed: number
}

export interface AuditLog {
  content: {
    id: number;
    action: string;
    entityType: string;
    entityId: number;
    userId: number;
    details: string;
    timestamp: string;
  }[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface AdminStatisticsOverview {
  totalRevenue: number;
  totalLaborCost: number;
  totalMaterialCost: number;
  netIncome: number;
  totalRepairOrders: number;
  completedRepairOrders: number;
  averageCustomerRating: number;
}

export interface BlockchainProof {
  orderId: number;
  blockHash: string;
  transactionHash: string;
  timestamp: string;
  verified: boolean;
  proofData: {
    orderStatus: string;
    completionTime: string;
    totalCost: number;
    workerId: number;
  };
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  version: string;
  database: string;
  redis: string;
}

export interface SystemStatus {
  uptime: string;
  activeUsers: number;
  activeWorkers: number;
  systemLoad: number;
  memoryUsage: number;
  diskUsage: number;
}

export interface SubmitOrder {
  orderId: number
  issue: string
  createTime: string
  assignTime?: string
  acceptTime?: string
  completeTime?: string
  status: string
  laborCost?: number
  materialCost?: number
  totalCost?: number
  workerId?: number
  workerName?: string
  vehicleId: number
  licensePlate: string
  repairType?: string
  materials?: Material[]
  cannotReject?: boolean
}