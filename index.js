const fs = require('fs')
const path = require('path')
const md = require('markdown-it')()

const validar = (files, isDirectory) => {
  const externalPath = process.argv[2]
  const absolutePath = path.resolve(externalPath)

  files = filtrar(files, absolutePath)

  if (files.length === 0) {
    if (isDirectory) {
      console.log('No hay archivos Markdown', externalPath, '.')
    } else {
      console.log('El archivo', externalPath, 'no es de tipo Markdown.')
    }
    return null
  }

  for (const file of files) {
    const buffer = fs.readFileSync(file)
    const content = buffer.toString()
    const markdownRender = md.render(content)
    console.log(markdownRender)
  }
}

const filtrar = (files, absolutePath) => {
  const filtrados = []
  for (const file of files) {
    const ext = path.extname(file)
    if (ext === '.md') {
      const added = path.isAbsolute(file) ? file : path.join(absolutePath, file)
      filtrados.push(added)
    }
  }
  return filtrados
}

const command = (parametro) => {
  const externalPath = parametro
  const absolutePath = path.resolve(externalPath)
  const isDirectory = path.extname(absolutePath) === ''

  if (isDirectory) {
    fs.readdir(absolutePath, (err, found) => {
      if (err) {
        console.log('Hay un error en la carpeta y no se puede leer: ', err)
        return err
      }

      validar(found, true)
    })
  } else {
    fs.stat(absolutePath, (err, stats) => {
      if (err) {
        console.log('No existe el archivo', absolutePath)
        return err
      }

      validar([absolutePath], false)
    })
  }
}

// Ejecución por Terminal
command(process.argv[2])

// Ejecución como librería
module.exports = (file) => {
  return command(file)
}

