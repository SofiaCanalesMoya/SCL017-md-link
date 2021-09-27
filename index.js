const fs = require('fs')
const path = require('path')
const md = require("markdown-it")();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

/**
 * Por cada uno de los archivos válidos, debo validar si tiene links.
 * - Si tiene, se extraen.
 * - Si no, se imprime un error: "Este archivo no tiene link's.".
 */
const validar = (files, isDirectory) => {
  const externalPath = process.argv[2]
  const absolutePath = path.resolve(externalPath);

  files = filtrar(files, absolutePath)

  if (files.length === 0) {
    if (isDirectory) {
      console.error('No hay archivos Markdown (.md) en el directorio', externalPath, '.')
    } else {
      console.error('El archivo', externalPath, "no es de tipo Markdown (.md).")
    }
    return 0
  }

  for (const file of files) {
    const buffer = fs.readFileSync(file)
    const content = buffer.toString()
    const markdownRender = md.render(content);
    const htmlRender = new JSDOM(`<html>${markdownRender}</html>`);
    console.log(markdownRender);
    console.log(htmlRender);
    console.log(htmlRender.window.document.links);
  }
}

/**
 * - Si es directorio, hay que validar si existe algún Markdown.
 * - Si es un archivo, hay que validar que este archivo sea Markdown.
 */
const filtrar = (files, absolutePath) => {
  const filtrados = []
  for (const file of files) {
    const ext = path.extname(file);
    if (ext === ".md") {
      const added = path.isAbsolute(file)
        ? file
        : path.join(absolutePath, file);
      filtrados.push(added);
    }
  }
  return filtrados
}

const command = ([nodePath, entrypoint, externalPath, ...args]) => {
  const validate = args.includes('--validate')

  /**
   * Identificar la ruta (relativa o absoluta)
   * - Si es relativa, debo transformarla en absoluta
   */
  const absolutePath = path.resolve(externalPath)

  /**
   * Hay que identificar si el parametro recibido es un directorio o un archivo
   * - Si es directorio, hay que recorrerlo para encontrar todos los archivos MD del directorio.
   */
  const isDirectory = path.extname(absolutePath) === ''

  /**
   * - Si es directorio, hay que validar si existe algún Markdown.
   * - Si es un archivo, hay que validar que este archivo sea Markdown.
   */
  if (isDirectory) {
    fs.readdir(absolutePath, (err, found) => {
      if (err) {
        // Error para leer directorio
        console.log('Ha ocurrido un error al leer el contenido del directorio, err: ', err)
        return err
      }

      validar(found, true)
    })
  } else {
    fs.stat(absolutePath, (err, stats) => {
      if (err) {
        console.log("El archivo", absolutePath, "indicado no existe.");
        return err;
      }

      validar([absolutePath], false)
    })
  }
}

command(process.argv)

module.exports = () => {
  // ...
};
