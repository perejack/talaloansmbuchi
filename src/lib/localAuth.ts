// Local Storage Authentication & Storage Service

export interface LocalUser {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  created_at: string;
}

export interface LocalLoanApplication {
  id: string;
  user_id: string;
  loan_amount: number;
  loan_purpose: string;
  status: 'approved' | 'in_progress' | 'rejected' | 'disbursed';
  created_at: string;
}

const USERS_STORAGE_KEY = 'afriquick_registered_users';
const CURRENT_USER_KEY = 'afriquick_current_user';
const LOANS_STORAGE_KEY = 'afriquick_user_loans';

type AuthListener = (user: LocalUser | null) => void;
const listeners: Set<AuthListener> = new Set();

function notifyListeners(user: LocalUser | null) {
  listeners.forEach((listener) => {
    try {
      listener(user);
    } catch (e) {
      console.error('Error in auth listener:', e);
    }
  });
}

export class LocalAuthService {
  static getUsers(): (LocalUser & { password?: string })[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static getCurrentUser(): LocalUser | null {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static signUp({
    email,
    password,
    fullName,
    phoneNumber,
  }: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
  }): { user: LocalUser } {
    const trimmedEmail = email.trim().toLowerCase();
    const users = this.getUsers();

    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      throw new Error('An account with this email already exists. Please sign in.');
    }

    const newUser: LocalUser & { password?: string } = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      email: trimmedEmail,
      full_name: fullName.trim(),
      phone_number: phoneNumber.trim(),
      password,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Save session without exposing password in current user
    const { password: _, ...cleanUser } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cleanUser));
    notifyListeners(cleanUser);

    return { user: cleanUser };
  }

  static signIn({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): { user: LocalUser } {
    const trimmedEmail = email.trim().toLowerCase();
    const users = this.getUsers();

    const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!user) {
      throw new Error('Invalid email or password. Please check your credentials or sign up.');
    }

    if (user.password && user.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    const { password: _, ...cleanUser } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cleanUser));
    notifyListeners(cleanUser);

    return { user: cleanUser };
  }

  static signOut(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
    notifyListeners(null);
  }

  static onAuthStateChange(callback: AuthListener): { unsubscribe: () => void } {
    listeners.add(callback);
    return {
      unsubscribe: () => {
        listeners.delete(callback);
      },
    };
  }

  // Loans management in localStorage
  static getLoans(userId?: string): LocalLoanApplication[] {
    try {
      const data = localStorage.getItem(LOANS_STORAGE_KEY);
      const loans: LocalLoanApplication[] = data ? JSON.parse(data) : [];
      if (userId) {
        return loans.filter((loan) => loan.user_id === userId);
      }
      return loans;
    } catch {
      return [];
    }
  }

  static saveLoan(loan: Omit<LocalLoanApplication, 'id' | 'created_at'>): LocalLoanApplication {
    const newLoan: LocalLoanApplication = {
      ...loan,
      id: `loan_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const loans = this.getLoans();
    loans.unshift(newLoan);
    localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(loans));
    return newLoan;
  }
}
