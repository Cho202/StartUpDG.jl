
"""
    n_verts_between(n, from, to, dim)

Compute the coordinates of n equally distributed points between the points
given by `from` and `to`. `dim` is the dimension of `from` and `to`. 
Inspired by: https://github.com/ju-kreber/paraview-scripts/blob/master/node_ordering.py
"""
function n_verts_between(n, from, to)
    if n <= 0
        return
    end
    dim = length(from)
    @assert length(from) == length(to)
    edge_verts = [LinRange(from[i], to[i], n+2)[2: 1+n] for i in 1:dim]
    return edge_verts
end

function sort_by_axis(corner_verts)
    permutation = sortperm([corner_verts[:,i] for i in 1:size(corner_verts)[2]])
    return corner_verts[:, permutation]
end


"""
    triangle_vtk_order(corner_verts, order, dim, skip = false)

Compute the coordinates of a `VTK_LAGRANGE_TRIANGLE` of a triangle or order `order` 
defined by the coordinates of the vertices given in `corner_verts`. `dim` is the
dimension of the coordinates given. If `skip` is set to true, the coordinates
of the vertex- and edge-points aren't computed, which can be used to compute
points of a `VTK_LAGRANGE_WEDGE`
Inspired by: https://github.com/ju-kreber/paraview-scripts/blob/master/node_ordering.py
"""
function triangle_vtk_order(corner_verts, order, dim, skip = false)
    if order < 0
        return nothing
    end
    if order == 0
        # For recursion
        return corner_verts[:,1]
    end
    #Corner vertices
    coords = Matrix{Float64}(undef, dim, 0)
    if skip == false
        coords = corner_verts
    end
    #edge vertices
    num_verts_on_edge = order -1 
    # edges in vtk-order
    edges = [(1,2), (2,3), (3,1)]
    for (frm, to) in edges
        if skip == false
            tmp = n_verts_between(num_verts_on_edge, corner_verts[:, frm], corner_verts[:, to])
            tmp_vec = Vector{Float64}(undef, dim)
            for i in 1:num_verts_on_edge
                for j in 1:dim
                    tmp_vec[j] = tmp[j][i]
                end
                coords = hcat(coords, tmp_vec)
            end
        end
    end
    if order == 2
        return coords
    end
    #faces
    e_x = (corner_verts[:,2] .- corner_verts[:,1]) ./ order
    e_y = (corner_verts[:,3] .- corner_verts[:,1]) ./ order
    inc = [(e_x + e_y) (-2*e_x + e_y) (e_x - 2*e_y)]
    if order >= 3
        coords = hcat(coords, triangle_vtk_order(corner_verts .+ inc, order - 3, dim, false))
    end
    return coords
end

"""
    quad_vtk_order(corner_verts, order, dim, skip = false)

Compute the coordinates of a VTK_LAGRANGE_QUAD of a quad of order order 
defined by the coordinates of the vertices given in corner_verts. dim is the
dimension of the coordinates given. If skip is set to true, the coordinates
of the vertex- and edge-points aren't computed, which can be used to compute
points of a VTK_LAGRANGE_WEDGE
Inspired by: https://github.com/ju-kreber/paraview-scripts/blob/master/node_ordering.py
"""
function quad_vtk_order(corner_verts, order, dim, skip = false)
    coords = Matrix{Float64}(undef, dim, 0)
    if skip == false
        coords = copy(corner_verts)
    end
    num_verts_on_edge = order - 1
    edges = [(1,2), (2,3), (4,3), (1,4)]
    for (frm, to) in edges
        if skip == false
            tmp = n_verts_between(num_verts_on_edge, corner_verts[:,frm], corner_verts[:,to])
            tmp_vec = Vector{Float64}(undef, dim)
            for i in 1:num_verts_on_edge
                for j in 1:dim
                    tmp_vec[j] = tmp[j][i]
                end
                coords = hcat(coords, tmp_vec)
            end
        end
    end
    e_x = (corner_verts[:,2] .- corner_verts[:,1])./order
    e_y = (corner_verts[:,4] .- corner_verts[:,1])./order
    pos_y = copy(corner_verts[:,1])
    for i in 1:num_verts_on_edge
        pos_y = pos_y .+ e_y
        pos_yx = pos_y
        for j in 1:num_verts_on_edge
            pos_yx = pos_yx .+ e_x
            coords = hcat(coords, pos_yx)
        end
    end
    return coords
end

"""
    wedge_vtk_order(corner_verts, order, dim)

Compute the coordinates of a VTK_LAGRANGE_wedge of a wedge of order order 
defined by the coordinates of the vertices given in corner_verts. dim is the
dimension of the coordinates given. If skip is set to true, the coordinates
of the vertex- and edge-points aren't computed, which can be used to compute
points of a VTK_LAGRANGE_WEDGE
Inspired by: https://github.com/ju-kreber/paraview-scripts/blob/master/node_ordering.py
"""
function wedge_vtk_order(corner_verts, order, dim)
    coords = copy(corner_verts)
    num_verts_on_edge = order - 1
    edges = [(1,2), (2,3), (3,1), (4,5), (5,6), (6,4), (1,4), (2,5), (3,6)]
    for (frm, to) in edges
        tmp = n_verts_between(num_verts_on_edge, corner_verts[:, frm], corner_verts[:, to])
        tmp_vec = Vector{Float64}(undef, dim)
        for i in 1:num_verts_on_edge
            for j in 1:dim
                tmp_vec[j] = tmp[j][i]
            end
            coords = hcat(coords, tmp_vec)
        end
    end
    tri_faces = [(1,2,3), (4,5,6)]
    quad_faces = [(1,2,5,4), (2,3,6,5), (1,3,6,4)]
    for indices in tri_faces
        tri_nodes = Matrix{Float64}(undef,dim,0)
        tmp_vec = Vector{Float64}(undef, dim)
        for j in indices
            tri_nodes = hcat(tri_nodes,corner_verts[:,j])
        end
        face_coords = triangle_vtk_order(tri_nodes, order, 3, true)
        face_coords = sort_by_axis(face_coords)
        if length(face_coords) > 0
            for i in range(1,size(face_coords)[2])
                for j in 1:dim
                    tmp_vec[j] = face_coords[j,i]
                end
                coords = hcat(coords, tmp_vec)
            end
        end
    end
    for indices in quad_faces
        tmp_vec = Vector{Float64}(undef, dim)
        quad_nodes = Matrix{Float64}(undef, dim,0)
        for j in indices
            quad_nodes = hcat(quad_nodes, corner_verts[:,j])
        end
        face_coords = quad_vtk_order(quad_nodes, order, 3, true)
        println(size(face_coords))
        if length(face_coords) > 0
            for i in 1:size(face_coords)[2]
                for j in 1:dim
                    println(i, " ", j)
                    tmp_vec[j] = face_coords[j,i]
                end
                coords = hcat(coords, tmp_vec)
            end
        end
    end
    e_z = (corner_verts[:,4] - corner_verts[:,1]) ./ order
    pos_z = copy(corner_verts[:,1])
    for i in range(1,num_verts_on_edge)
        tmp_vec = Vector{Float64}(undef, dim)
        pos_z += e_z
        interior_tri_verts = [corner_verts[:,1] corner_verts[:,2] corner_verts[:,3]] .+ pos_z
        face_coords = triangle_vtk_order(interior_tri_verts, order, 3,true)
        face_coords = sort_by_axis(face_coords)
        println(face_coords)
        println(size(face_coords))
        if length(face_coords) > 0
            for k in range(1,size(face_coords)[2])
                for j in 1:dim
                    println(k, " ", j)
                    tmp_vec[j] = face_coords[j,k]
                end
                coords = hcat(coords, tmp_vec)
            end
        end
    end
    return coords
end

"""
    vtk_order(elem::Tri, order)

Construct all node-points of a VTK_LAGRANGE_TRIANGLE of order order. The corner-nodes are
given by the reference-triangle used by StartUpDG
"""
function vtk_order(elem::Tri, order)
    tri_sud_vertices = [-1.0 1.0 -1.0; -1.0 -1.0 1.0]
    return triangle_vtk_order(tri_sud_vertices, order, 2)
end

"""
    vtk_order(elem::Quad, order)

Construct all node-points of a VTK_LAGRANGE_TRIANGLE of order order. The corner-nodes are
given by the reference-triangle used by StartUpDG
"""
function vtk_order(elem::Quad, order)
    quad_sud_vertices = [-1.0 1.0 1.0 -1.0; -1.0 -1.0 1.0 1.0]
    return quad_vtk_order(quad_sud_vertices, order, 2)
end

"""
    vtk_order(elem::Wedge, order)

Construct all node-points of a VTK_LAGRANGE_TRIANGLE of order order. The corner-nodes are
given by the reference-triangle used by StartUpDG
"""
function vtk_order(elem::Wedge, order)
    wedge_sud_vertices = [-1.0 1.0 -1.0 -1.0 1.0 -1.0; -1.0 -1.0 1.0 -1.0 -1.0 1.0; -1.0 -1.0 -1.0 1.0 1.0 1.0]
    return wedge_vtk_order(wedge_sud_vertices, order, 3)
end

"""
    SUD_to_vtk_order(rd::RefElemData, dim)

Compute the permutation of the nodes between StartUpDG and VTK
"""
function SUD_to_vtk_order(rd::RefElemData{DIM}) where {DIM}
    #nodes in vtk order
    vtk_nodes = vtk_order(rd.element_type, rd.N)
    vtk_formatted = Tuple(vtk_nodes[i,:] for i in 1:DIM)
        
    #nodes in StartUpDG order
    interpolate = vandermonde(rd.element_type, rd.N, equi_nodes(rd.element_type, rd.N)...) / rd.VDM
    equi_dist_vertices = map(x->interpolate * x, rd.rst)

    #permutation
    return match_coordinate_vectors(vtk_formatted, equi_dist_vertices)
end

"""
    type_to_vtk(elem::Tri)
    return the VTK-type
"""
function type_to_vtk(elem::Tri)
    return VTKCellTypes.VTK_LAGRANGE_TRIANGLE
end

"""
    type_to_vtk(elem::Quad)
    return the VTK-type
"""
function type_to_vtk(elem::Quad)
    return VTKCellTypes.VTK_LAGRANGE_QUADRILATERAL
end

"""
    type_to_vtk(elem::Wedge)
    return the VTK-type
"""
function type_to_vtk(elem::Wedge)
    return VTKCellTypes.VTK_LAGRANGE_WEDGE
end

