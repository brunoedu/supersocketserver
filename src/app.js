const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const documents = [];

io.on("connection", socket => {
    let previousId;
    const safeJoin = currentId => {
      socket.leave(previousId);
      socket.join(currentId);
      previousId = currentId;
    };
  
    socket.on("getDoc", docId => {
      safeJoin(docId);
      socket.emit("document", documents.find(d => d.id == docId));
    });
  
    socket.on("addDoc", doc => {
      documents.push(doc);
      safeJoin(doc.id);
      io.emit("documents", documents);
      socket.emit("document", doc);
    });
  
    socket.on("editDoc", doc => {
      if(!doc) return;
      let document = documents.find(d => d.id == doc.id);
      documents[documents.indexOf(document)] = doc;
      io.emit("documents", documents);
      socket.to(doc.id).emit("document", doc);
    });
  
    io.emit("documents", documents);
  });

  http.listen(process.env.PORT || 4444);