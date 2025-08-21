import { IncomingForm } from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Desactivar el body parser por defecto
  },
};

const uploadProductImage = (req: NextApiRequest, res: NextApiResponse) => {
  const form = new IncomingForm({
    uploadDir: path.join(process.cwd(), 'public', 'productos'),
    keepExtensions: true, // Mantener las extensiones de los archivos subidos
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al subir la imagen' });
    }

    if (!files.imagen || !Array.isArray(files.imagen) || files.imagen.length === 0) {
      return res.status(400).json({ error: 'No se encontró ninguna imagen' });
    }

    const imageFile = files.imagen[0]; // Usamos [0] porque los archivos pueden ser enviados como un array
    const imageUrl = `/productos/${imageFile.newFilename}`;

    const product = {
      nombre: fields.nombre,
      precio: fields.precio,
      stock: fields.stock,
      imagen: imageUrl, // Guardamos solo la URL de la imagen
    };

    // Aquí guardarías el producto en tu base de datos (esto depende de tu configuración de DB)

    res.status(200).json({
      message: 'Producto creado correctamente',
      imageUrl,
      product,
    });
  });
};

export default uploadProductImage;
