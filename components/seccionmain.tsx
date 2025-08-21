export default function Seccion (){

return(
<div className="bg-slate-100 flex flex-row items-center">
    <div className="flex flex-col justify-center items-center text-center p-[100px] text-slate-900 font-bold text-lg md:text-sm h-auto md:h-[600px]">
        <h1 className="text-3xl md:text-2xl transition-transform transform hover:scale-105">
        ¡Explora un mundo lleno de oportunidades con el modelo de pago por oferta! 🌟
        </h1>
        <br></br>
        <br></br>
        <h3 className="text-slate-600">
        Imagina tener acceso a una variedad de servicios especializados, pagando solo por aquello que realmente te interesa.<br></br> 
        Este modelo no solo es económico, sino que también pone el control en tus manos, permitiéndote elegir lo que mejor se adapta a tus necesidades.<br></br> 

        Ya sea que busques diseño, desarrollo web, marketing, consultoría o cualquier otro servicio, este sistema abre las puertas a soluciones flexibles y personalizadas.<br></br> 
        Cada oferta representa una posibilidad de crecimiento, innovación o simplemente la ayuda que necesitas para alcanzar tus metas.
        </h3>
        <br></br>
        <br></br>
        <h2 className="text-slate-600">
        💡 Atrévete a explorar. Confía en este enfoque dinámico, donde cada elección es una inversión estratégica y accesible. Porque las grandes oportunidades están a solo una oferta de distancia.
        </h2>
        <br></br>
        <br></br>
        <h4 className="text-2xl md:text-xl transition-transform transform hover:scale-105">
        ¡Convierte cada clic en una puerta hacia nuevas posibilidades! 🚀
        </h4>
    </div>
    <img
        src="/hero.jpg"
        alt="seccion"
        width={"440px"}
        className="h-[200px] w-[300px] hidden md:block bg-gradient-to-r from-purple-500 to-pink-500 flex justify-center items-center text-white text-lg [border-top-left-radius:200px] [border-top-right-radius:50px] [border-bottom-left-radius:90px] [border-bottom-right-radius:250px] rotate-[15deg] shadow-xl"
    />
</div>
)
}