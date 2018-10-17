
var inserisciProcedura = () =>
{
    document.querySelector("#inserisciProcedura").className = "";
    document.querySelector("#proceduraTable").className = "d-none";
    document.querySelector("#inserisciEvento").className = "d-none";
    document.querySelector("#eventoTable").className = "d-none";    
}

var salvaProcedura = () =>
{
    event.preventDefault();
    var form = new FormData(document.querySelector('#inserisciProcedura'));
    fetch(hostname+"/api/procedura/insert", {
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
                        document.querySelector("#inserisciProcedura").className = "d-none";
                        document.querySelector("#inserisciProcedura").reset();
                    }
            }
        else
            alert("Inserimento Non Riuscito!");
      });
        
}

var annullaInsertProcedura = () =>
{
    event.preventDefault();
    document.querySelector("#inserisciProcedura").className = "d-none";
}