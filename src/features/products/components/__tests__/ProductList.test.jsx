import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProductList from '../ProductList';
import { toast } from 'react-toastify';

// Mock de las dependencias
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

// Mock de datos de prueba
const mockProducts = [
  { id: '1', name: 'Producto 1', category: 'Categoría 1', price: 1000 },
  { id: '2', name: 'Producto 2', category: 'Categoría 2', price: 2000 }
];

describe('ProductList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza la lista de productos correctamente', () => {
    render(
      <BrowserRouter>
        <ProductList products={mockProducts} />
      </BrowserRouter>
    );

    mockProducts.forEach(product => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(product.category)).toBeInTheDocument();
      expect(screen.getByText(product.price.toString())).toBeInTheDocument();
    });
  });

  // Pruebas de usabilidad
  describe('Usabilidad', () => {
    test('muestra mensaje cuando no hay productos', () => {
      render(
        <BrowserRouter>
          <ProductList products={[]} />
        </BrowserRouter>
      );

      expect(screen.getByText(/no hay productos/i)).toBeInTheDocument();
    });

    test('permite ordenar productos por nombre', async () => {
      render(
        <BrowserRouter>
          <ProductList products={mockProducts} />
        </BrowserRouter>
      );

      const sortButton = screen.getByRole('button', { name: /ordenar/i });
      fireEvent.click(sortButton);

      await waitFor(() => {
        const productNames = screen.getAllByTestId('product-name');
        expect(productNames[0].textContent).toBe('Producto 1');
        expect(productNames[1].textContent).toBe('Producto 2');
      });
    });

    test('muestra spinner durante la carga', () => {
      render(
        <BrowserRouter>
          <ProductList products={[]} loading={true} />
        </BrowserRouter>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  // Pruebas de accesibilidad
  describe('Accesibilidad', () => {
    test('los productos tienen roles y etiquetas apropiadas', () => {
      render(
        <BrowserRouter>
          <ProductList products={mockProducts} />
        </BrowserRouter>
      );

      const productItems = screen.getAllByRole('listitem');
      expect(productItems).toHaveLength(mockProducts.length);

      productItems.forEach(item => {
        expect(item).toHaveAttribute('aria-label');
      });
    });

    test('los botones de acción tienen textos descriptivos', () => {
      render(
        <BrowserRouter>
          <ProductList products={mockProducts} />
        </BrowserRouter>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  // Pruebas de seguridad
  describe('Seguridad', () => {
    test('sanitiza los datos de entrada', () => {
      const productWithScript = {
        id: '3',
        name: '<script>alert("xss")</script>Producto Malicioso',
        category: 'Categoría',
        price: 1000
      };

      render(
        <BrowserRouter>
          <ProductList products={[productWithScript]} />
        </BrowserRouter>
      );

      const productElement = screen.getByTestId('product-name');
      expect(productElement.innerHTML).not.toContain('<script>');
    });

    test('valida los precios antes de mostrarlos', () => {
      const productWithInvalidPrice = {
        id: '4',
        name: 'Producto',
        category: 'Categoría',
        price: 'no-es-un-numero'
      };

      render(
        <BrowserRouter>
          <ProductList products={[productWithInvalidPrice]} />
        </BrowserRouter>
      );

      expect(screen.getByText('Precio no disponible')).toBeInTheDocument();
    });
  });
});
