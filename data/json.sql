USE Demo
GO

DECLARE @DayNum AS varchar(10);
SET @DayNum = '1981/02/06';

SELECT 
	CONCAT(YEAR(dt_iso), '-', FORMAT(CAST(dt_iso AS Date), 'MM')) AS group_key,
	MAX(temp) AS temp,
	MAX(temp) AS max_temp,
	MIN(temp) AS min_temp, 
	DATENAME(mm, dt_iso) AS 'date.month_name',
	DATENAME(dw, dt_iso) AS 'date.day_name', 
	MONTH(dt_iso) AS 'date.month', 
	DAY(dt_iso) AS 'date.day', 
	YEAR(dt_iso) AS 'date.year',
	STUFF((SELECT DISTINCT '; ' + US.weather_main 
          FROM kingston_1981 US
		  WHERE CAST(US.dt_iso AS Date) = CAST(k.dt_iso AS Date)
          FOR XML PATH('')), 1, 1, '') [weather.main],
	STUFF((SELECT DISTINCT '; ' + US.weather_description
          FROM kingston_1981 US
		  WHERE CAST(US.dt_iso AS Date) = CAST(k.dt_iso AS Date)
          FOR XML PATH('')), 1, 1, '') [weather.description]

FROM kingston_1981 k

--WHERE CONVERT(VARCHAR(10), dt_iso, 111) = @DayNum

GROUP BY 
	--CONCAT(YEAR(dt_iso), '-', MONTH(dt_iso)), -- old group_key
	CONCAT(YEAR(dt_iso), '-', FORMAT(CAST(dt_iso AS Date), 'MM')), -- group_key
	CAST(k.dt_iso AS Date),		-- 'yyyy/mm/dd' - lookup key for STUFF 
	DATENAME(mm, dt_iso),		-- 'date.month_name
	DATENAME(dw, dt_iso),		-- 'date.day_name'
	MONTH(dt_iso),				-- 'date.month'
	DAY(dt_iso),				-- 'date.day'
	YEAR(dt_iso)				-- 'date.year'

ORDER BY group_key

--FOR JSON PATH, ROOT('temps')
--FOR JSON AUTO
FOR JSON PATH