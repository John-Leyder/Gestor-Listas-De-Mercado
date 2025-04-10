import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CategoryList from '../CategoryList';
import { toast } from 'react-toastify';

// Mock de las dependencias
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

// Mock de datos de prueba
const mockCategories = [
  { id: '1', name: 'Categoría 1', description: 'Descripción 1' },
  { id: '2', name: 'Categoría 2', description: 'Descripción 2' }
];

describe('CategoryList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza la lista de categorías correctamente', () => {
    render(
      <BrowserRouter>
        <CategoryList categories={mockCategories} />
      </BrowserRouter>
    );

    mockCategories.forEach(category => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
      expect(screen.getByText(category.description)).toBeInTheDocument();
    });
  });

  // Pruebas de usabilidad
  describe('Usabilidad', () => {
    test('muestra mensaje cuando no hay categorías', () => {
      render(
        <BrowserRouter>
          <CategoryList categories={[]} />
        </BrowserRouter>
      );

      expect(screen.getByText(/no hay categorías/i)).toBeInTheDocument();
    });

    test('permite filtrar categorías', async () => {
      render(
        <BrowserRouter>
          <CategoryList categories={mockCategories} />
        </BrowserRouter>
      );

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      fireEvent.change(searchInput, { target: { value: 'Categoría 1' } });

      await waitFor(() => {
        expect(screen.getByText('Categoría 1')).toBeInTheDocument();
        expect(screen.queryByText('Categoría 2')).not.toBeInTheDocument();
      });
    });

    test('muestra estados de carga apropiados', () => {
      render(
        <BrowserRouter>
          <CategoryList categories={[]} loading={true} />
        </BrowserRouter>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  // Pruebas de accesibilidad
  describe('Accesibilidad', () => {
    test('los elementos tienen roles y etiquetas apropiadas', () => {
      render(
        <BrowserRouter>
          <CategoryList categories={mockCategories} />
        </BrowserRouter>
      );

      const categoryItems = screen.getAllByRole('listitem');
      expect(categoryItems).toHaveLength(mockCategories.length);

      categoryItems.forEach(item => {
        expect(item).toHaveAttribute('aria-label');
      });
    });

    test('el campo de búsqueda tiene label asociado', () => {
      render(
        <BrowserRouter>
          <CategoryList categories={mockCategories} />
        </BrowserRouter>
      );

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveAccessibleName();
    });
  });

  // Pruebas de seguridad
  describe('Seguridad', () => {
    test('sanitiza los datos de entrada', () => {
      const categoryWithScript = {
        id: '3',
        name: '<script>alert("xss")</script>Categoría Maliciosa',
        description: 'Descripción normal'
      };

      render(
        <BrowserRouter>
          <CategoryList categories={[categoryWithScript]} />
        </BrowserRouter>
      );

      const categoryElement = screen.getByTestId('category-name');
      expect(categoryElement.innerHTML).not.toContain('<script>');
    });

    test('valida los datos antes de mostrarlos', () => {
      const invalidCategory = {
        id: '4',
        name: '', // Nombre vacío
        description: 'Descripción'
      };

      render(
        <BrowserRouter>
          <CategoryList categories={[invalidCategory]} />
        </BrowserRouter>
      );

      expect(screen.getByText('Nombre no disponible')).toBeInTheDocument();
    });

    test('maneja errores de carga graciosamente', () => {
      render(
        <BrowserRouter>
          <CategoryList categories={[]} error="Error de carga" />
        </BrowserRouter>
      );

      expect(screen.getByText(/error de carga/i)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
