import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "./RegisterPage";

const { mockLogin, mockNavigate, mockRegisterApi } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockNavigate: vi.fn(),
  mockRegisterApi: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({ login: mockLogin }),
}));

vi.mock("@/api/auth", () => ({
  authApi: {
    register: (...args: unknown[]) => mockRegisterApi(...args),
    login: vi.fn(),
    getMe: vi.fn(),
    logout: vi.fn(),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders create account heading", () => {
    renderPage();

    expect(screen.getByText("Create your account")).toBeInTheDocument();
  });

  it("renders all form inputs", () => {
    renderPage();

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("renders create account button", () => {
    renderPage();

    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
  });

  it("renders sign in link", () => {
    renderPage();

    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.type(screen.getByLabelText("Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "different");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    expect(mockRegisterApi).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    const mockResponse = {
      user: { id: 1, email: "test@example.com", name: "Test User", avatarUrl: null, createdAt: "2025-01-01" },
      token: "jwt-123",
    };
    mockRegisterApi.mockResolvedValue(mockResponse);

    renderPage();

    await user.type(screen.getByLabelText("Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockRegisterApi).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        passwordConfirmation: "password123",
      });
    });

    expect(mockLogin).toHaveBeenCalledWith({
      user: mockResponse.user,
      token: mockResponse.token,
    });
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("shows error on failed registration", async () => {
    const user = userEvent.setup();
    mockRegisterApi.mockRejectedValue(new Error("Email already taken"));

    renderPage();

    await user.type(screen.getByLabelText("Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "taken@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(screen.getByText("Email already taken")).toBeInTheDocument();
    });
  });

  it("renders RecipeMatch branding", () => {
    renderPage();

    expect(screen.getByText("RecipeMatch")).toBeInTheDocument();
  });
});
