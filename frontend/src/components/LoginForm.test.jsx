// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const googleLogin = vi.fn();
vi.mock('@react-oauth/google', () => ({ useGoogleLogin: () => googleLogin }));
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { AuthLayout } from '../layouts/AuthLayout';

beforeEach(() => {
    googleLogin.mockReset();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

const loginProps = (over = {}) => ({
    email: '', setEmail: vi.fn(), password: '', setPassword: vi.fn(),
    onSubmit: vi.fn(e => e.preventDefault()), onToggle: vi.fn(),
    onGoogleSuccess: vi.fn(), onGoogleError: vi.fn(), loading: false, error: null, ...over,
});

describe('Acceso', () => {
    it('los campos tienen etiqueta visible asociada (no solo placeholder)', () => {
        render(<LoginForm {...loginProps()} />);
        const email = screen.getByLabelText('Correo electrónico');
        expect(email).toHaveAttribute('type', 'email');
        expect(email).toHaveAttribute('autocomplete', 'email');
        expect(screen.getByText('Correo electrónico').tagName).toBe('LABEL');
        expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
    });

    it('Google es un botón con texto y Apple queda deshabilitado', async () => {
        const user = userEvent.setup();
        render(<LoginForm {...loginProps()} />);
        await user.click(screen.getByRole('button', { name: 'Iniciar sesión con Google' }));
        expect(googleLogin).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button', { name: /Apple \(próximamente\)/ })).toBeDisabled();
    });

    it('muestra el error del servidor como alerta y el estado de carga en el botón', () => {
        render(<LoginForm {...loginProps({ error: 'Credenciales incorrectas', loading: true })} />);
        expect(screen.getByRole('alert')).toHaveTextContent('Credenciales incorrectas');
        expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled();
    });

    it('el registro pide nombre, correo y contraseña con etiquetas visibles', () => {
        render(<RegisterForm nameUsers="" setNameUsers={vi.fn()} email="" setEmail={vi.fn()} password="" setPassword={vi.fn()} onSubmit={vi.fn()} onToggle={vi.fn()} loading={false} error={null} />);
        expect(screen.getByLabelText('Nombre completo')).toHaveAttribute('autocomplete', 'name');
        expect(screen.getByLabelText('Correo')).toHaveAttribute('type', 'email');
        expect(screen.getByLabelText('Contraseña')).toHaveAttribute('autocomplete', 'new-password');
        expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument();
    });
});

describe('Estrella MAJA del acceso', () => {
    it('está en el logo (una sola), gira cada 3 s y es decorativa; no hay escena 3D', () => {
        render(<AuthLayout><p>formulario</p></AuthLayout>);
        const [star, ...rest] = screen.getAllByTestId('estrella-maja');
        expect(rest).toHaveLength(0);
        expect(star).toHaveAttribute('aria-hidden', 'true');
        expect(star.querySelector('img')).toHaveClass('estrella-ciclo');
        expect(star.parentElement).toHaveTextContent('MAJA');
        expect(screen.queryByTestId('fabric-hero')).not.toBeInTheDocument();
    });

    it('pasar el cursor por cualquier parte del logo le da una vuelta, y puede repetirse', () => {
        render(<AuthLayout><p>formulario</p></AuthLayout>);
        const star = screen.getByTestId('estrella-maja');
        const logo = star.parentElement;
        expect(star).not.toHaveClass('estrella-vuelta');
        fireEvent.mouseEnter(logo);
        expect(star).toHaveClass('estrella-vuelta');
        fireEvent.animationEnd(star);
        expect(star).not.toHaveClass('estrella-vuelta');
        fireEvent.mouseEnter(logo);
        expect(star).toHaveClass('estrella-vuelta');
    });
});
