

var inserisciEvento = () =>
{
    document.querySelector("#inserisciEvento").className=""
    document.querySelector("#inserisciProcedura").className = "d-none";
    document.querySelector("#proceduraTable").className = "d-none";
    document.querySelector("#eventoTable").className = "d-none";    
    document.querySelector("#inserisciEvento").reset();

    fetch(hostname+'/api/procedura/getall')
    .then((res) => res.json())
    .then((data) => {
        if(data!=null)
        {
            var selector = document.querySelector("#proceduraSelector");
            //Pulisco selecotr Procedure
            selector.innerHTML = '';
            data.forEach((item,index,array)=>
            {
                var option = document.createElement("option");
                option.value = item._id;
                option.innerHTML = item.Name;
                selector.appendChild(option);
            })
            document.querySelector("#submitEvento").setAttribute("onclick","salvaEvento()");
        }
        else
        {
            alert("Non ci sono procedure!");
            document.querySelector("#inserisciEvento").className="d-none"
        }
    });
}


var annullaInsertEvento = () =>
{
    event.preventDefault();
    document.querySelector("#inserisciEvento").className = "d-none";
}


var salvaEvento = () =>
{
    event.preventDefault();
    var form = new FormData(document.querySelector('#inserisciEvento'));
    fetch(hostname+"/api/evento/insert", {
        method: "POST",
        body: form
      })
      .catch((error)=>   console.error(error))
      .then((res) => res.json())
      .then((data) => {
        if(data!=null)
            {
                if(confirm("Inserimento Riuscito"))
                    {
                        document.querySelector("#inserisciEvento").className = "d-none";
                        document.querySelector("#inserisciEvento").reset();
                    }
            }
        else
            alert("Inserimento Non Riuscito!");
      });
}