import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

const { mockLogin, mockNavigate, mockLoginApi } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockNavigate: vi.fn(),
  mockLoginApi: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: "/login", search: "", hash: "", key: "default" }),
  };
});

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({ login: mockLogin }),
}));

vi.mock("@/api/auth", () => ({
  authApi: {
    login: (...args: unknown[]) => mockLoginApi(...args),
    register: vi.fn(),
    getMe: vi.fn(),
    logout: vi.fn(),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sign in heading", () => {
    renderPage();

    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    renderPage();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders sign in button", () => {
    renderPage();

    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("renders sign up link", () => {
    renderPage();

    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("submits form with valid credentials", async () => {
    const user = userEvent.setup();
    const mockResponse = {
      user: { id: 1, email: "test@example.com", name: "Test", avatarUrl: null, createdAt: "2025-01-01" },
      token: "jwt-123",
    };
    mockLoginApi.mockResolvedValue(mockResponse);

    renderPage();

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockLoginApi).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(mockLogin).toHaveBeenCalledWith({
      user: mockResponse.user,
      token: mockResponse.token,
    });
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("shows error message on failed login", async () => {
    const user = userEvent.setup();
    mockLoginApi.mockRejectedValue(new Error("Invalid email or password"));

    renderPage();

    await user.type(screen.getByLabelText("Email"), "wrong@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
  });

  it("renders RecipeMatch branding", () => {
    renderPage();

    expect(screen.getByText("RecipeMatch")).toBeInTheDocument();
  });
});
