'use strict'


let theList = []

const addNewBtn = document.querySelector('#add-new')
const dropZone = document.querySelectorAll('.list')
const wrapper = document.querySelector('.wrapper')





const modifyList = (object)=>{
    theList.push(object)
}


// IDB conection an such

// ================================================================

const IDBRequest = indexedDB.open('workList', 1)

// ========================== EVENTOS IDB ==========================
IDBRequest.addEventListener('upgradeneeded', async()=>{
    const db = await IDBRequest.result   
    await db.createObjectStore('task', { autoIncrement: true})
    console.log('Se creo la base de datos')
})
IDBRequest.addEventListener('success',()=>{
    console.log('Se conecto con la base de datos correctamente')
    IDBReadObjects()
})
IDBRequest.addEventListener('error',()=>{
    console.log('Ha ocurrido un error')
})


// ========================== Agregar ==========================
const IDBAddObject = (object) =>{
    // title==''? title='Vacio': title=title
    
    if( object.desc == '' ) object.desc= 'Vacio'

    const db =  IDBRequest.result
    const IDBTransaction = db.transaction('task', 'readwrite')
    const objectStore = IDBTransaction.objectStore('task')
    
    objectStore.add(object)
    
    IDBTransaction.addEventListener('complete',()=>{
        console.log('objeto Agregado correctamente')
        IDBReadObjects()
    })
    
}


// ========================== Leer ==========================
const IDBReadObjects = () =>{

    const db = IDBRequest.result
    const IDBTransaction =  db.transaction('task', 'readwrite')
    const objectStore =  IDBTransaction.objectStore('task')
    const cursor =  objectStore.openCursor()
    
    // hacer reset a todo antes de volver a imprimir.
    dropZone.forEach(zone=>{ zone.innerHTML = null})
    theList = []
    
    cursor.addEventListener('success',()=>{
        
        if(cursor.result){
            
            let result = {
                key: cursor.result.key,
                title: cursor.result.value.title,
                desc: cursor.result.value.desc,
                state: cursor.result.value.state
            }

            showInList(result)

            modifyList(result)
            
            cursor.result.continue()

        }  
        
    })
    
}



// ========================== Modificar ==========================
const IDBModObject = (key, object) =>{
    
    const db =  IDBRequest.result
    const IDBTransaction = db.transaction('task', 'readwrite')
    const objectStore = IDBTransaction.objectStore('task')
    
    // console.log('object: ' + object, 'key:' + key)
    objectStore.put(object, key)

    
    IDBTransaction.addEventListener('complete',()=>{
        console.log('objeto Modificado correctamente')
        IDBReadObjects()
    }) 
    
}



// ========================== Eliminar ==========================
const IDBDelObject = (key) =>{
    const db =  IDBRequest.result
    const IDBTransaction = db.transaction('task', 'readwrite')
    const objectStore = IDBTransaction.objectStore('task')
    
    objectStore.delete(key)
    
    IDBTransaction.addEventListener('complete',()=>{
        console.log('objeto Eliminado correctamente')
        IDBReadObjects()
    })  
} 



// ========================== DRAG AND DROP ==========================

// ========================== DROP AREAS ==========================
dropZone.forEach( zone=>{
    
    zone.addEventListener('dragover', e=>{
        e.preventDefault()
    })
    
    zone.addEventListener('drop', (e)=>{   

        let draged = document.querySelector('.dragging')
        
        let newState = parseInt(zone.getAttribute('data-list'))
        
        let key = parseInt(draged.getAttribute('id'))

        let object = searcher(key)
        
        
        zone.appendChild(draged)

        IDBModObject(key, {title: object.title, desc: object.desc, state: newState})

    })
})


// ejemplo de como "quitar" propiedades de un objeto con el operador spread. 
// var myObject = {
//     "id":"12345",
//     "subject":"programming",
//     "grade":"A"
// };
// console.log("Original object:",myObject);

// var {grade , ...myUpdatedObject} = myObject;

// console.log("The removed 'grade' property : ",grade)
// console.log("Updated object : ",myUpdatedObject)
// console.log("Original object after update:",myObject);







const closeModal= ()=>{
    let modal = document.querySelector('.modal-background')    
    wrapper.removeChild(modal)
}



const searcher= (index)=>{

    console.log(theList)

    let found = theList.find((object) => { 
        
        if(object.key == index) return object

    })

    return found
    
}



const editTask= (key)=>{
    
    
    let found = searcher(key)
    console.log(found)
    
    openModal(found)

}



const justShow= (title, desc)=>{

    console.log('Holaaaa')
    
    const modalBg = document.createElement('DIV')

    modalBg.className= 'modal-background'
    modalBg.innerHTML =  `
        <div class='modal just-show'>
            <div class='modal-area-1'></div>
            <div class='modal-area-2'><button id='close-modal' class='g-btn' >X</button></div>
            <div class='modal-area-3'><h2>${title}</h2></div>
            <div class='modal-area-4'><p>${desc}</p></div>
        </div>
    `;

    modalBg.querySelector('#close-modal').addEventListener('click', ()=> closeModal() )
    
    wrapper.appendChild(modalBg)
}



const createListItem= ({key, title, desc, state})=>{

    // console.log({key, title, desc, state})

    const li = document.createElement('LI')

    li.className = 'list-item'
    li.setAttribute('data-state', state)
    li.setAttribute('draggable', true)
    li.setAttribute('id', key)
    li.innerHTML = `
            
        <div><h4 class='taskTitle'>${title}</h4></div>
        <button class="list-item-btn edit-btn">editar</button>
        <button class="list-item-btn delete-btn">borrar</button>
    
    `;
    
    

    li.querySelector('.taskTitle').addEventListener('dblclick', ()=>{
        justShow(title, desc)
    })

    li.addEventListener('dragstart', ()=>{
        li.classList.add('dragging')
    })

    li.addEventListener('dragend', ()=>{
        li.classList.remove('dragging')
    })
    
    
    li.querySelector('.edit-btn').addEventListener('click', ()=> editTask(key) )
    li.querySelector('.delete-btn').addEventListener('click', ()=> IDBDelObject(key) )

    return li
}



const showInList= (object)=>{
    
    let li = createListItem(object)
            
    dropZone[object.state].appendChild(li)


}



const msg= (msg,color)=>{
    console.log(`%c${msg}`, `color:${color};`)
}



const openModal= (object)=>{

    // console.log(object)

    const modalBg = document.createElement('DIV')

    modalBg.className= 'modal-background'
    modalBg.innerHTML =  `
        <div class='modal'>
            <div class='modal-area-1'><h2>Crear nueva tarea</h2></div>
            <div class='modal-area-2'><button id='close-modal' class='g-btn' >X</button></div>
            <div class='modal-area-3'><input type='text' id='create-title' placeholder="Titulo" value='${object != undefined? object.title: ''}'></div>
            <div class='modal-area-4'><textarea id='create-description' placeholder='Descripcion de la tarea'>${object != undefined? object.desc: ''}</textarea></div>
            <div class='modal-area-5'><button id='createItem' class='g-btn'>${object != undefined? 'Editar': 'Crear' }</button></div>
        </div>
    `;

    modalBg.querySelector('#close-modal').addEventListener('click', ()=> closeModal() )

    //esto es para buscar uno en especifico.
    if(object != undefined){
        
        //este es para cuando se edita uno ya existente
        modalBg.querySelector('#createItem').addEventListener('click', ()=>{ 
            
            let newTitle = modalBg.querySelector('#create-title').value     
            let newDescription = modalBg.querySelector('#create-description').value 

            IDBModObject(object.key, {...object, title: newTitle, desc: newDescription})

            closeModal()

        })


    }else{

        //este es para cuando se crea uno nuevo
        modalBg.querySelector('#createItem').addEventListener('click', ()=>{ 

            let newTitle = modalBg.querySelector('#create-title').value     
            let newDescription = modalBg.querySelector('#create-description').value 

            if(newTitle != ''){ 

                IDBAddObject({title: newTitle, desc: newDescription, state: 0})

                closeModal()

            }   
            
            else msg('El titulo no puede estar vacio.', '#e22') 

        })

    }

    wrapper.appendChild(modalBg)
}


addNewBtn.addEventListener('click', ()=> openModal())


