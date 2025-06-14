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
  id: number
  username: string
  phone: string
}

export interface Worker {
  id: number
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
  id: number
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
  id: number
  orderId: number
  vehicleId: number
  licensePlate: string
  issue: string
  repairDescription: string
  materialsCost: number
  laborCost: number
  totalCost: number
  total: number
  workerName: string
  submitTime: string
  completionTime: string
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
  id: number
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

export interface Earning {
  totalEarnings: number
  thisMonthEarnings: number
  completedOrders: number
  averageOrderValue: number
}

export interface WorkerPerformance {
  workerId: number
  workerName: string
  specialty: string
  completedOrders: number
  totalHours: number
  totalEarnings: number
  efficiency: number
  completionRate: number
  averageRating: number
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
  workerId: number;
  workerName: string;
  settlementMonth: string;
  baseSalary: number;
  bonus: number;
  totalEarnings: number;
  settlementDate: string;
}

export interface VehicleRepairStats {
  brand: string;
  model: string;
  repairCount: number;
  averageCost: number;
  commonIssues: string[];
}

export interface CostAnalysis {
  period: string;
  totalCost: number;
  laborCostRatio: number;
  materialCostRatio: number;
  breakdown: {
    category: string;
    totalCost: number;
    laborCost: number;
    materialCost: number;
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
  totalNegativeFeedback: number;
  feedbacks: {
    orderId: number;
    workerId: number;
    workerName: string;
    rating: number;
    comment: string;
    category: string;
    submitTime: string;
  }[];
  workerStats: {
    workerId: number;
    workerName: string;
    negativeFeedbackCount: number;
    totalFeedbackCount: number;
    negativeRatio: number;
  }[];
}

export interface SpecialtyWorkload {
  specialty: string;
  workerCount: number;
  receivedTasks: number;
  completedTasks: number;
  taskRatio: number;
  completionRate: number;
  averageHoursPerTask: number;
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