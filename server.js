var express = require('express');
var app = express();
var port = 3000;
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const cors = require('cors');
var mariadb = require('mariadb');
app.use(express.json());
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const axios = require('axios');

const pool = mariadb.createPool({
   host: 'localhost',
   user: 'root',
   password: 'root',
   database: 'sample',
   port: 3306,
   connectionLimit: 5
});

const options = {
    swaggerDefinition: {
      info: {
        title: 'Assignment 08',
        version: '1.0.1',
        description: 'ITIS-6177 Assignment 08 - Swagger doc',
      },
      host:'localhost:3000',
      basePath: '/',
    },
    apis: ['./server.js'],
  };

const specs = swaggerJsdoc(options);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs));
app.use(cors());

/**
 * @swagger
 * /agents:
 *     get: 
 *       description: Fetch all agents
 *       produces:
 *            - application/json
 *       responses:
 *           200:
 *              description: return all agents from the agents table
 *           500:
 *              description: Internal server error
 * 
 */

app.get('/agents', (req, res) => {
    pool.getConnection()
    .then(conn => {
    
      conn.query("SELECT * from agents")
        .then((rows) => {
          //console.log(rows); 
          res.setHeader('Content-Type','Application/json');
          res.setHeader('Created-by', 'GVSH');
          res.json(rows);
        })
    });
    
});

/**
 * @swagger
 * /orders:
 *     get: 
 *       description: Fetch all order details
 *       produces:
 *            - application/json
 *       responses:
 *           200:
 *              description: return all order details from the orders table
 *           500:
 *              description: Internal server error
 * 
 */

 app.get('/orders', (req, res) => {
    pool.getConnection()
    .then(conn => {
    
      conn.query("SELECT * from orders")
        .then((rows) => {
          //console.log(rows); 
          res.setHeader('Content-Type','Application/json');
          res.setHeader('Created-by', 'GVSH');
          res.json(rows);
        });
    });
    
});

/**
 * @swagger
 * /customer:
 *     get: 
 *       description: Fetch all customers
 *       produces:
 *            - application/json
 *       responses:
 *           200:
 *              description: return all customers from the customer table
 *           500:
 *              description: Internal server error
 * 
 */

 app.get('/customer', (req, res) => {
    pool.getConnection()
    .then(conn => {
    
      conn.query("SELECT * from customer")
        .then((rows) => {
          //console.log(rows); 
          res.setHeader('Content-Type','Application/json');
          res.setHeader('Created-by', 'GVSH');
          res.json(rows);
        })
    });
    
});

/**
 * @swagger
 * definitions:
 *  agents:
 *   type: object
 *   properties:
 *    agent_code:
 *     type: string
 *     description: agent_code
 *     example: 'A010'
 *    agent_name:
 *     type: string
 *     description: name of the agent
 *     example: 'Ramasundar'
 *    working_area:
 *     type: string
 *     description: location where agent works
 *     example: 'Bangalore'
 */

/**
 * @swagger
 * /agent:
 *  post:
 *   summary: create agent
 *   description: Insert new record in agents table
 *   parameters:
 *    - agent_code: body
 *      agent_name: body
 *      required: true
 *      description: body of the agents
 *      schema:
 *       $ref: '#/definitions/agents'
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/definitions/agents'
 *   responses:
 *    200:
 *     description: success
 *    500:
 *     description : error
 */


 app.post('/agents',

 check('agent_code').isLength({
    max: 4
}).withMessage('agent_code should have max length of 4').not().isEmpty().trim(),
check('agent_name').isLength({
    max: 20
}).withMessage('Agent name should have max length of 20').not().isEmpty().trim(),
check('working_area').isLength({
    max: 20
}).withMessage('working area should have max length of 20').not().isEmpty().trim(),
 
 (req, res) => {
    const errors = validationResult(req);
    const { agent_code, agent_name, working_area } = req.body;
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            
            errors: errors.array()
        });
    }


    pool.getConnection()
    .then(conn => {
        conn.query(`select * from agents where agent_code = '${agent_code}'`).then((result) => {
            if(result.length > 0){    
            res.json("Agent code already exists in the table");
          }
          else {
    
      conn.query('INSERT INTO `agents` (`AGENT_CODE`, `AGENT_NAME`, `WORKING_AREA`) VALUES (?, ?, ?)',
      [agent_code, agent_name, working_area])
        .then((rows) => {
          console.log(rows); 
          res.setHeader('Content-Type','Application/json');
          res.setHeader('Created-by', 'GVSH');
          res.json(rows);
        })
    }
    });
});
});

/**
 * @swagger
 * /agents/{agent_code}:
 *  delete:
 *   summary: delete agent
 *   description: delete record from agents table
 *   parameters:
 *    - in: path
 *      name: agent_code
 *      schema:
 *       type: String
 *      required: true
 *      description: agent code
 *      example: 'A001'
 *   responses:
 *    200:
 *     description: Record deleted
 *    500:
 *     description: Error occured while deleting
 */

 app.delete('/agents/:agent_code', 
 check('agent_code').isLength({
    max: 4
}).withMessage('Agent code should have max length of 4').not().isEmpty().trim(),
 
 (req, res) => {
   const id =  req.params.agent_code
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
    return res.status(400).json({
        
        errors: errors.array()
    });
}
  


    pool.getConnection()
    .then(conn => {
        conn.query(`select * from agents where agent_code = '${agent_code}'`).then((result) => {
            if(result.length == 0){    
            res.json("Agent not found");
          }
          else {
    
      conn.query(`DELETE FROM agents WHERE agent_code = '${agent_code}'`)
        .then((rows) => {
          //console.log(rows); 
          res.setHeader('Content-Type','Application/json');
          res.setHeader('Created-by', 'GVSH');
          res.json(rows);
        })
    
}
});
});
 });


/**
 * @swagger
 * /agents:
 *  put:
 *   summary: create or update agents
 *   description: create or update record in agents table
 *   parameters:
 *    - in: body
 *      name: body
 *      required: true
 *      description: body of the agents
 *      schema:
 *       $ref: '#/definitions/agents'
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/definitions/agents'
 *   responses:
 *    200:
 *     description: created or updated successfully
 *    500:
 *     description : error occured while creating or updating
 */

 app.put('/agents', 
 
 check('agent_code').isLength({
    max: 4
}).withMessage('Agent code should have max length of 4').not().isEmpty().trim(),
check('agent_name').isLength({
    max: 20
}).withMessage('Agent name should have max length of 20').not().isEmpty().trim(),
check('working_area').isLength({
    max: 20
}).withMessage('working area should have max length of 20').not().isEmpty().trim(),
 
 
 
 (req, res) => {
    console.log(req.body);
    const { agent_code, agent_name, working_area } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            
            errors: errors.array()
        });
    }



    pool.getConnection()
    .then(conn => {

      conn.query(`select * from agents where agent_code = '${agent_code}'`).then((result) => {
      if(result.length == 0){    
      conn.query('INSERT INTO `agents` (`agent_code`, `agent_name`, `working_area`) VALUES (?, ?, ?)',
      [agent_code, agent_name, working_area])
        .then((rows) => {
          console.log(rows); 
          res.setHeader('Content-Type','Application/json');
          res.setHeader('Created-by', 'GVSH');
          res.json(rows);
        });
    }
    else {
        conn.query(`update agents set agent_name = '${agent_name}', working_area = '${working_area}' where agent_code = '${agent_code}'`)
        .then((rows) => {
          console.log(rows); 
          res.setHeader('Content-Type','Application/json');
          res.setHeader('Created-by', 'GVSH');
          res.json(rows);
        });

    }
    });
});
});

/**
 * @swagger
 * /agents/{agent_code}:
 *    patch:
 *      description: Update a record from agents table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Updated record from agents table
 *          500:
 *              descriptiom: Error occured while updating 
 *      parameters:
 *          - name: agent_code
 *            in: path
 *            required: true
 *            type: string
 *          - name: agent_name
 *            description: agents object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/agents_for_update'
 *
 */

app.patch('/agents/:agent_code', 

   
check('agent_code').isLength({
    max: 4
}).withMessage('agent code  should have max length of 4').not().isEmpty().trim(),
check('agent_name').isLength({
    max: 20
}).withMessage('Agent name should have max length of 20').not().trim(),
check('working_area').isLength({
    max: 20
}).withMessage('Working area should have max length of 20').not().trim(),
   



    (req, res) => {



    const id =  req.params.agent_code
    const { agent_name, working_area } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            
            errors: errors.array()
        });
    }
    
    

    pool.getConnection()
    .then(conn => {
    conn.query(`select * from agents where agent_code = '${agent_code}'`).then((result) => {
        if(result.length == 0){    
        res.json("agent Not found, Please enter valid one");
      }
      else {

        if(agent_name && working_area) {
          conn.query(`update agents set agent_name = '${agent_name}', working_area = '${working_area}' where agent_code = '${agent_code}'`)
          .then((rows) => {
            console.log(rows); 
            res.setHeader('Content-Type','Application/json');
            res.setHeader('Created-by', 'GVSH');
            res.json(rows);
          }); }

          if(agent_name && !working_area) {
            conn.query(`update agents set agent_name = '${agent_name}' where agent_code = '${agent_code}'`)
            .then((rows) => {
              console.log(rows); 
              res.setHeader('Content-Type','Application/json');
              res.setHeader('Created-by', 'GVSH');
              res.json(rows);
            }); }

            if(working_area && !agent_name) {
                conn.query(`update agents set working_area = '${working_area}' where agent_code = '${agent_code}'`)
                .then((rows) => {
                  console.log(rows); 
                  res.setHeader('Content-Type','Application/json');
                  res.setHeader('Created-by', 'GVSH');
                  res.json(rows);
                }); }
  
      }
      });
    }); 


   });



app.listen(port, () => {
    console.log(` app listening at http://localhost:${port}`)
    });