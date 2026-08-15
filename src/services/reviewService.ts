export interface ReviewFinding {
  id: number;
  codeReviewId: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'BUG' | 'SECURITY' | 'PERFORMANCE' | 'MAINTAINABILITY' | 'DESIGN' | 'TESTING';
  title: string;
  description: string;
  file: string;
  startLine?: number;
  endLine?: number;
  evidence: string;
  recommendation: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  createdAt: string;
}

export interface CodeReview {
  id: number;
  repositoryId: number;
  fileOrContext: string;
  codeSnippet: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  review: CodeReview;
  findings: ReviewFinding[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export class ReviewService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async createReview(repositoryId: number | string, fileOrContext: string, codeSnippet: string): Promise<ReviewSummary> {
    const res = await fetch(`/api/repositories/${repositoryId}/reviews`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ fileOrContext, codeSnippet }),
    });
    if (!res.ok) throw new Error('Failed to create review');
    return res.json();
  }

  async getReviews(repositoryId: number | string): Promise<CodeReview[]> {
    const res = await fetch(`/api/repositories/${repositoryId}/reviews`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  }

  async getReviewDetails(repositoryId: number | string, reviewId: number | string): Promise<ReviewSummary> {
    const res = await fetch(`/api/repositories/${repositoryId}/reviews/${reviewId}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch review details');
    return res.json();
  }

  async updateFindingStatus(findingId: number, status: 'PENDING' | 'REVIEWED' | 'DISMISSED'): Promise<ReviewFinding> {
    const res = await fetch(`/api/reviews/findings/${findingId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update finding status');
    return res.json();
  }
}

export const reviewService = new ReviewService();
