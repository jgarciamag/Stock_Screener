import React from 'react';

function Intro() {
   return (
      <div className="flex items-center justify-center flex-col text-center pt-20 pb-6">
         <div>
            <h1 className="text-4xl md:text-6xl dark:text-white mb-1 md:mb-3 font-bold">Juan Pablo</h1>
         </div>
         <div>
            <h1 className="text-2xl md:text-4xl text-gray-500 font-light-bold">García Magaña</h1>

         </div>
         
         <br />
         <p className="text-base md:text-xl mb-3 font-medium">Actuario con Enfoque en los Riesgos Financieros </p>
         <p className="text-sm max-w-xl mb-6 font-bold text-justify">
            Soy Juan Pablo García, un apasionado actuario que encuentra su lugar en la intersección entre las finanzas y la programación. Me gusta crear proyectos que optimicen los procesos internos y estén directamente relacionados con el mundo financiero, aprovechando tanto mis habilidades en análisis actuarial como en desarrollo de software.
            <br />
            <br />
            Mi enfoque se centra en construir soluciones desde cero, abordando problemas reales con código y diseño meticuloso. Cada línea de código que escribo y cada proyecto que realizo reflejan mi pasión por fusionar la tecnología con las finanzas, y usar esta misma para resolver problemas.
            <br />
            <br />
            Mi objetivo es construir un puente entre las finanzas (y cualquier otra ciencia) y la programación, creando un espacio donde la innovación y la eficiencia se fusionen para impulsar el éxito en el mundo digital, compartiendo mi conocimiento y experiencia e inspirando a otros a explorar las infinitas posibilidades que surgen al combinar la imaginación y las ganas de resolver un problema. 
            <br />
            <br />
            Todo mi contenido lo puedes encontrar en mi canal de Youtube: {' '}
            <a
               href="https://www.youtube.com/@juanpablogarciamagana3496"
               target="_blank"
               className="text-cyan-600 hover:underline underline-offset-2 decoration-2 decoration-red-600"
               rel="noreferrer noopener"
            >
               JPGama
            </a>{' '}
            <br />
            <br />
            <br />
            ¡O HACIENDO CLICK EN CUALQUIERA DE MIS PROYECTOS!
            <br />
         </p>
      </div>
   )
}

export default Intro;