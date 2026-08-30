"""Limpia datos inconsistentes del rol piloto CPEC18 para poder probar
el flujo end-to-end de generación Typst desde el frontend."""
import psycopg2

DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "sea_evaluaciones"
DB_USER = "postgres"
DB_PASSWORD = "postgres"

ROL_ID = "ROL-CPEC18-TA01-1P"


def main():
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
    )
    conn.autocommit = False
    cur = conn.cursor()
    try:
        # 1. Verificar banco asociado y rango de reactivos
        cur.execute("""
            SELECT id FROM sea_bancos_preguntas
            WHERE rol_examen_id = %s OR rol_examen_id IS NULL
            ORDER BY fecha_aprobacion DESC
        """, (ROL_ID,))
        bancos = cur.fetchall()
        print("Bancos encontrados para CPEC18:", [b[0] for b in bancos])

        if bancos:
            banco_id = bancos[0][0]
            cur.execute("SELECT MIN(id), MAX(id) FROM sea_reactivos WHERE banco_id = %s", (banco_id,))
            min_id, max_id = cur.fetchone()
            print(f"Reactivos del banco {banco_id}: ids {min_id}..{max_id}")

        # 2. Borrar dependencias del rol CPEC18
        tablas = [
            ("sea_calificaciones_omr", "rol_examen_id"),
            ("sea_mapeo_estudiantes_variantes", "rol_examen_id"),
            ("sea_examenes_variantes", "rol_examen_id"),
        ]
        for tabla, columna in tablas:
            cur.execute(f"DELETE FROM {tabla} WHERE {columna} = %s", (ROL_ID,))
            print(f"  -> Eliminados {cur.rowcount} registros de {tabla}")

        # 3. Resetear contadores y estado del rol a VALIDADO
        cur.execute("""
            UPDATE sea_roles_evaluaciones
            SET estado_flujo = 'VALIDADO',
                variantes_generadas_count = 0,
                estudiantes_inscritos_count = 0,
                fecha_generacion = NULL
            WHERE id = %s
        """, (ROL_ID,))
        print(f"  -> Rol {ROL_ID} reseteado a VALIDADO")

        # 4. Limpiar también el rol de test si existe
        cur.execute("""
            SELECT id FROM sea_roles_evaluaciones
            WHERE id LIKE 'ROL-SIS413-TA01-1P-TEST%'
        """)
        tests = cur.fetchall()
        for (test_id,) in tests:
            for tabla, columna in tablas:
                cur.execute(f"DELETE FROM {tabla} WHERE {columna} = %s", (test_id,))
            cur.execute("""
                UPDATE sea_roles_evaluaciones
                SET estado_flujo = 'VALIDADO',
                    variantes_generadas_count = 0,
                    estudiantes_inscritos_count = 0,
                    fecha_generacion = NULL
                WHERE id = %s
            """, (test_id,))
            print(f"  -> Rol test {test_id} reseteado a VALIDADO")

        conn.commit()
        print("Limpieza completada.")
    except Exception as e:
        conn.rollback()
        print("Error durante limpieza:", e)
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()
