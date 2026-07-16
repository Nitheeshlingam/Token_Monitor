import db from "../config/db.js";


// ===========================================
// Dashboard Summary
// ===========================================

export const getSummary = async (req, res) => {
  try {

    const {
      startDate,
      endDate,
      model = "ALL"
    } = req.query;


    let conditions = [];
    let params = [];


    if(startDate){
      conditions.push(
        "DATE(created_at) >= ?"
      );
      params.push(startDate);
    }


    if(endDate){
      conditions.push(
        "DATE(created_at) <= ?"
      );
      params.push(endDate);
    }


    if(model !== "ALL"){
      conditions.push(
        "model = ?"
      );
      params.push(model);
    }


    const where =
      conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";


    const [rows] = await db.execute(
`
SELECT

COUNT(*) AS totalRequests,

COALESCE(
SUM(input_tokens),0
) AS inputTokens,


COALESCE(
SUM(output_tokens),0
) AS outputTokens,


COALESCE(
SUM(billable_tokens),0
) AS billableTokens,

COALESCE(
SUM(estimated_cost),0
) AS estimatedCost,

COALESCE(
AVG(latency_ms),0
) AS averageLatency,

SUM(
CASE 
WHEN status='SUCCESS'
THEN 1
ELSE 0
END
) AS successRequests,


SUM(
CASE 
WHEN status='FAILED'
THEN 1
ELSE 0
END
) AS failedRequests


FROM request_logs

${where}

`,
params
);


res.json({
success:true,
data:rows[0]
});


}catch(err){

console.error(err);

res.status(500).json({
success:false,
message:err.message
});

}

};




// ===========================================
// Request History
// ===========================================

export const getHistory = async(req,res)=>{

try{


const [rows]=await db.execute(
`
SELECT

id,

user_name AS name,

user_email AS email,

provider,

model,

image_name,

input_tokens,

output_tokens,

billable_tokens AS total_tokens,

estimated_cost,

latency_ms,

status,

created_at


FROM request_logs


ORDER BY created_at DESC

`
);


res.json({
success:true,
data:rows
});


}catch(err){

console.error(err);

res.status(500).json({
success:false,
message:err.message
});

}

};




// ===========================================
// Daily Usage
// ===========================================

// ===========================================
// Daily Usage
// ===========================================

export const getDailyUsage = async (req, res) => {

  try {

    const [rows] = await db.execute(
      `
     SELECT

DATE(created_at) AS day,

COUNT(*) AS requests,

COALESCE(SUM(input_tokens),0) AS inputTokens,

COALESCE(SUM(output_tokens),0) AS outputTokens,

COALESCE(SUM(billable_tokens),0) AS billableTokens,

COALESCE(SUM(estimated_cost),0) AS estimatedCost

FROM request_logs

GROUP BY DATE(created_at)

ORDER BY DATE(created_at);
      `
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};



// ===========================================
// Models
// ===========================================

export const getModels = async(req,res)=>{

try{


const [rows]=await db.execute(
`

SELECT DISTINCT model

FROM request_logs

WHERE model IS NOT NULL

ORDER BY model


`
);


res.json({

success:true,

models:
rows.map(r=>r.model),

defaultModel:"ALL"

});


}catch(err){

console.error(err);

res.status(500).json({
success:false,
message:err.message
});

}

};




// ===========================================
// Details
// ===========================================


export const getDetails = async(req,res)=>{

try{


const [rows]=await db.execute(
`

SELECT

id,

user_name AS name,

user_email AS email,

provider,

model,

input_tokens,

output_tokens,

billable_tokens,

api_total_tokens AS total_tokens,

estimated_cost,

latency_ms,

status,

created_at

FROM request_logs

ORDER BY created_at DESC

`
);


res.json({

success:true,

data:rows

});


}catch(err){

console.error(err);


res.status(500).json({

success:false,

message:err.message

});


}

};




// ===========================================
// Application Dashboard
// ===========================================


export const getApplicationDashboard = async (req, res) => {

  try {

    const { id } = req.params;

    const [[summary]] = await db.execute(

      `
      SELECT

        COUNT(*) AS total_requests,

        COALESCE(
          SUM(input_tokens),0
        ) AS input_tokens,

        COALESCE(
          SUM(output_tokens),0
        ) AS output_tokens,

        COALESCE(
          SUM(billable_tokens),0
        ) AS billable_tokens,

        COALESCE(
          SUM(estimated_cost),0
        ) AS total_cost,

        COALESCE(
          AVG(latency_ms),0
        ) AS average_latency,

        SUM(
          CASE
            WHEN status = 'SUCCESS' THEN 1
            ELSE 0
          END
        ) AS success_requests,

        SUM(
          CASE
            WHEN status = 'FAILED' THEN 1
            ELSE 0
          END
        ) AS failed_requests

      FROM request_logs

      WHERE application_id = ?

      `,
      [id]

    );

    res.json({
      success: true,
      summary
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};