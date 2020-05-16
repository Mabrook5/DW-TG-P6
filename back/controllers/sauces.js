// Ajout de plugin externe
const Sauces = require('../models/sauces');
const fs = require('fs');

// Creation d'une sauce
exports.createSauces = (req, res, next) => {
  const saucesObject = JSON.parse(req.body.sauce); //Récupération du coprs de la requete
  delete saucesObject._id;  // Supression de l'ID générer automatiquement
  const sauces = new Sauces({ // Creation d'un model de sauce
    ...saucesObject,
    imageUrl: `${req.protocol}://${req.get('host')}/sauce_image/${req.file.filename}` //Création du lien de l'image importer
  });
  sauces.save() // Sauvegarde des informations
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

// Recuperation d'une sauce avec son Id
exports.getOneSauces = (req, res, next) => {
  Sauces.findOne({    // recherche d'un element en fonction des paramettres utilisés
    _id: req.params.id  // parametres Id de la sauce
  }).then(
    (sauces) => {
      res.status(200).json(sauces);   // retour des inforlmations de la quace en fonction de l'id selectionner en objet
    }
  ).catch(  // retour d'une erreur si pas de sauce trouvée avec l'id recherché
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

// Modifiction d'une sauce
exports.modifySauces = (req, res, next) => {
  const saucesObject = req.file ? //Est ce qu'on a un fichier
    {
      ...JSON.parse(req.body.sauces), // recupération de des inforamtion de la requete
      imageUrl: `${req.protocol}://${req.get('host')}/sauce_image/${req.file.filename}`   // creation d'un lien pour l'image
    } : { ...req.body };
  Sauces.updateOne({ _id: req.params.id }, { ...saucesObject, _id: req.params.id }) //Mise a jour de la sauce par son ID
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

// Supression d'une sauce via son ID
exports.deleteSauces = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id })  // recherche d'un element en fonction des paramettres utilisés
  .then(sauces => {   // si la sauce trouvée
    const filename = sauces.imageUrl.split('/sauce_image/')[1]; // récuepration du fichier image de la sauce
    fs.unlink(`sauce_image/${filename}`, () => {  // supression de l'image récupéré
      Sauces.deleteOne({ _id: req.params.id })  // supression des données en BDD de la sauce en fonction de son ID
        .then(() => res.status(200).json({ message: 'Objet supprimé !'}))   //OK
        .catch(error => res.status(400).json({ error }));     // erreur
    });
  })
  .catch(error => res.status(500).json({ error }));   // pas de sauce trouvée
};

//recuperation de toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauces.find().then( // recherche de toutes les information des la BDD
    (sauces) => { // si information trouvées
      res.status(200).json(sauces); // retour des informations en objets
    }
  ).catch(  // si pas de sauces trouvées
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

// like or dislike ??
exports.usersLike =(req, res, next) => {
  //Mise en place de constante pour la suite de la fonction
  const userId = req.body.userId;
  const like = req.body.like;
  const sauceId = req.params.id;
  if (like == 1){  // like de la sauce pouce vert cliquer
    Sauces.updateMany( // update est obselete preference de updateMany
    { _id: sauceId }, // Paramétres de recherche pour mettre a jour la valeur des like et le tableau des Users qui like la sauce
      {
        $inc: { likes: 1 }, // ajout de 1 au nombre de likes
        $push: { usersLiked: userId } // ajout du userId au tableau des usersLiked
      }
    )
    .then(
      () => {
        res.status(200).json({message: 'L\' utilisateur aime la sauce'});
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  }else if (like == -1){ // dislike de la sauce pouce rouge cliquer
    Sauces.updateMany(  // update est obselete preference de updateMany
      { _id: sauceId }, // Paramétres de recherche pour mettre a jour la valeur des dislike et le tableau des Users qui n'aime pas la sauce
        {
          $inc: { dislikes: 1 }, // ajout de 1 au nombre de dislikes
          $push: { usersDisliked: userId } // ajout du userId au tableau des usersDisliked
        }
      )
      .then(
        () => {
          res.status(200).json({message: 'L\' utilisateur n\' aime pas la sauce'});
        }
      ).catch(
        (error) => {
          res.status(404).json({
            error: error
          });
        }
      );
  }else{ // unlike or undislike ? Pouce vert ou rouge recliquer pour retirer son choix
    Sauces.findOne({ _id: req.params.id })// recherche de la sauce par sont _id dans la bdd par la sauce selectionné par l 'utilisateur
    .then(
      (sauces) => {
      if (sauces.usersDisliked.find(userId => userId === req.body.userId)){ // verification que l'utilisateur est bien dans le tableau des personnes qui aime pas la sauce
        Sauces.updateMany(  // update est obselete preference de updateMany
        { _id: sauceId }, 
          {
            $inc: { dislikes: -1 }, // suppression de 1 au nombre de dislikes
            $pull: { usersDisliked: userId } // suppression du userId au tableau des usersDisliked
          }
        )
        .then(
          () => {
            res.status(200).json({message: 'L\' utilisateur n\' aimais pas la sauce et il a changer d\' avis'});
          }
        ).catch(
          (error) => {
            res.status(404).json({ error: error });
          }
        );        
      }else{
      Sauces.updateMany( // update est obselete preference de updateMany
        { _id: sauceId }, 
          {
            $inc: { likes: -1 }, // suppression de 1 au nombre de likes
            $pull: { usersLiked: userId } // suppression du userId au tableau des usersLiked
          }
        )
        .then(() => 
        {
          res.status(200).json({message: 'L\' utilisateur aimais la sauce et il a changer d\' avis'});
        })
        .catch( (error) => 
        {
          res.status(404).json({ error: error });
        });
      }
    })
    .catch(
      (error) => { // erreur si pas de sauces trouvé
        res.status(404).json({ error: error });
      }
    );
  };
};