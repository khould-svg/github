export interface InvestmentSummaryDto {
  totalInvestments: number;
  activeInvestments: number;
  pendingInvestments: number;
  exitedInvestments: number;
  totalInvestedAmount: number;
}

export interface InvestmentAnalyticsDto {
  income: number;
  expense: number;
  balance: number;
  chartData: {
    label: string;
    income: number;
    expense: number;
  }[];
}

export interface PendingInvestmentsDto {
  totalPending: number;
  data: {
    _id: string;
    investorName: string;
    investorEmail: string;
    propertyName: string;
    amountInvested: number;
    sharesPurchased: number;
    propertyLocation: string;
    sharePrice: number;
    remainingShares: number;
    investmentDate: string;
    status: string;
  }[];
}

export interface TransactionsDashboardDto {
  totalTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalByType: {
    _id: string; 
    totalAmount: number;
    count: number;
  }[];
  recentTransactions: {
    _id: string;
    walletId: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string } | null;
  }[];
}

export interface TransactionsUserDto {
  user: { name: string; email: string } | null;
  totalTransactions: number;
  byStatus: {
    pending: number;
    completed: number;
    failed: number;
  };
  byType: Record<string, number>;
  transactions: {
    _id: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    user: { name: string; email: string } | null;
  }[];
}

export interface CustomersCountDto {
  count: number;
}


export interface PropertyProgressDto {
  properties: {
    title: string;
    amount: number;
    progress: string; 
    variant: "success" | "warning" | "danger";
    icon: string;
  }[];
}

export interface PropertiesCountDto {
  count: number;
}


export interface WalletSummaryDto {
  balance: number;
  income: number;
  expense: number;
  wallets: {
    walletId: string;
    user: string;
    income: number;
    expense: number;
    balance: number;
    currencies: {
      currency: string;
      amount: number;
    }[];
  }[];
}

export interface WalletsDashboardDto {
  totalWallets: number;
  totalBalances: Record<string, number>;
  wallets: {
    walletId: string;
    user: { name: string; email: string } | null;
    balances: { currency: string; amount: number }[];
    totalBalance: number;
    recentTransactions: {
      _id: string;
      type: string;
      amount: number;
      currency: string;
      status: string;
      createdAt: string;
      user: { name: string; email: string } | null;
    }[];
    createdAt: string;
    updatedAt: string;
  }[];
}
